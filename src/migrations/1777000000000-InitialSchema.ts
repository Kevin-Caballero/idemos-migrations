import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777000000000 implements MigrationInterface {
  name = "InitialSchema1777000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ------------------------------------------------------------------ users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"             uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "name"           varchar      NOT NULL,
        "email"          varchar      NOT NULL,
        "password_hash"  varchar      NOT NULL,
        "created_at"     TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "last_login_at"  TIMESTAMP,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // ------------------------------------------------------------ initiatives
    await queryRunner.query(`
      CREATE TABLE "initiatives" (
        "id"             uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "source"         varchar      NOT NULL DEFAULT 'CONGRESO',
        "legislature"    varchar      NOT NULL,
        "type"           varchar      NOT NULL,
        "expediente"     varchar      NOT NULL,
        "title"          text         NOT NULL,
        "author"         varchar      NOT NULL,
        "procedure_type" varchar      NOT NULL,
        "current_status" varchar      NOT NULL,
        "committee"      varchar,
        "presented_at"   date         NOT NULL,
        "qualified_at"   date,
        "closed_at"      date,
        "created_at"     TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_initiatives" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_initiatives_expediente" UNIQUE ("expediente")
      )
    `);

    // ------------------------------------------------------- initiative_steps
    await queryRunner.query(`
      CREATE TABLE "initiative_steps" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "initiative_id" uuid         NOT NULL,
        "step_type"     varchar      NOT NULL,
        "description"   text         NOT NULL,
        "start_date"    date,
        "end_date"      date,
        "order_index"   integer      NOT NULL,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_initiative_steps" PRIMARY KEY ("id"),
        CONSTRAINT "FK_initiative_steps_initiative"
          FOREIGN KEY ("initiative_id") REFERENCES "initiatives" ("id")
          ON DELETE CASCADE
      )
    `);

    // ------------------------------------------------------- initiative_links
    await queryRunner.query(`
      CREATE TABLE "initiative_links" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "initiative_id" uuid         NOT NULL,
        "link_type"     varchar      NOT NULL,
        "url"           text         NOT NULL,
        "label"         varchar,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_initiative_links" PRIMARY KEY ("id"),
        CONSTRAINT "FK_initiative_links_initiative"
          FOREIGN KEY ("initiative_id") REFERENCES "initiatives" ("id")
          ON DELETE CASCADE
      )
    `);

    // ------------------------------------------------------------------ votes
    await queryRunner.query(`
      CREATE TABLE "votes" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"       uuid         NOT NULL,
        "initiative_id" uuid         NOT NULL,
        "choice"        varchar      NOT NULL,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_votes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_votes_user_initiative" UNIQUE ("user_id", "initiative_id"),
        CONSTRAINT "FK_votes_initiative"
          FOREIGN KEY ("initiative_id") REFERENCES "initiatives" ("id")
          ON DELETE CASCADE
      )
    `);

    // ------------------------------------------------- initiative_summaries
    await queryRunner.query(`
      CREATE TABLE "initiative_summaries" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "initiative_id" uuid         NOT NULL,
        "content"       text         NOT NULL,
        "model"         varchar      NOT NULL DEFAULT 'gpt-4o-mini',
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_initiative_summaries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_initiative_summaries_initiative" UNIQUE ("initiative_id"),
        CONSTRAINT "FK_initiative_summaries_initiative"
          FOREIGN KEY ("initiative_id") REFERENCES "initiatives" ("id")
          ON DELETE CASCADE
      )
    `);

    // --------------------------------------------- official_vote_results
    await queryRunner.query(`
      CREATE TABLE "official_vote_results" (
        "id"                uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "initiative_id"     uuid         NOT NULL,
        "yes_count"         integer      NOT NULL DEFAULT 0,
        "no_count"          integer      NOT NULL DEFAULT 0,
        "abstention_count"  integer      NOT NULL DEFAULT 0,
        "voted_at"          date,
        "updated_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_official_vote_results" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_official_vote_results_initiative" UNIQUE ("initiative_id"),
        CONSTRAINT "FK_official_vote_results_initiative"
          FOREIGN KEY ("initiative_id") REFERENCES "initiatives" ("id")
          ON DELETE CASCADE
      )
    `);

    // ---------------------------------------------------------------- follows
    await queryRunner.query(`
      CREATE TABLE "follows" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"       uuid         NOT NULL,
        "initiative_id" uuid         NOT NULL,
        "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follows" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_follows_user_initiative" UNIQUE ("user_id", "initiative_id"),
        CONSTRAINT "FK_follows_initiative"
          FOREIGN KEY ("initiative_id") REFERENCES "initiatives" ("id")
          ON DELETE CASCADE
      )
    `);

    // --------------------------------------------------------------- sync_log
    await queryRunner.query(`
      CREATE TABLE "sync_log" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "started_at"    TIMESTAMPTZ  NOT NULL,
        "finished_at"   TIMESTAMPTZ,
        "status"        varchar      NOT NULL DEFAULT 'pending',
        "inserted"      integer      NOT NULL DEFAULT 0,
        "updated"       integer      NOT NULL DEFAULT 0,
        "failed"        integer      NOT NULL DEFAULT 0,
        "total"         integer      NOT NULL DEFAULT 0,
        "error_message" text,
        CONSTRAINT "PK_sync_log" PRIMARY KEY ("id")
      )
    `);

    // ---------------------------------------------------------------- indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_initiatives_legislature" ON "initiatives" ("legislature")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_initiatives_type" ON "initiatives" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_initiatives_presented_at" ON "initiatives" ("presented_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_initiative_steps_initiative_id" ON "initiative_steps" ("initiative_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_initiative_links_initiative_id" ON "initiative_links" ("initiative_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_votes_initiative_id" ON "votes" ("initiative_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follows_user_id" ON "follows" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sync_log_started_at" ON "sync_log" ("started_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "follows"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "official_vote_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "initiative_summaries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "initiative_links"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "initiative_steps"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sync_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "initiatives"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
