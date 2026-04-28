# @idemos/migrations

Migraciones TypeORM y seeds para la base de datos PostgreSQL compartida de iDemos.

## Estructura

```
src/
  data-source.ts      # Configuración del DataSource de TypeORM
  migrations/         # Migraciones generadas
  seeds/              # Scripts de seed de datos iniciales
```

## Scripts

```bash
npm run migration:generate -- src/migrations/NombreMigracion  # Genera una migración nueva
npm run migration:run                                         # Aplica las migraciones pendientes
npm run migration:revert                                      # Revierte la última migración
npm run migration:show                                        # Lista el estado de las migraciones
npm run seed:run                                              # Ejecuta los seeds
```

## Required versions

| Tool / Package | Version |
| -------------- | ------- |
| Node.js        | >= 20.0 |
| TypeScript     | ^5.7.3  |
| TypeORM        | ^0.3.20 |
| ts-node        | ^10.9.2 |
| PostgreSQL     | >= 14   |

## Variables de entorno

| Variable      | Por defecto | Descripción                |
| ------------- | ----------- | -------------------------- |
| `DB_HOST`     | `localhost` | Host de PostgreSQL         |
| `DB_PORT`     | `5432`      | Puerto de PostgreSQL       |
| `DB_NAME`     | `idemos`    | Nombre de la base de datos |
| `DB_USER`     | `postgres`  | Usuario de PostgreSQL      |
| `DB_PASSWORD` | `postgres`  | Contraseña de PostgreSQL   |
