"""
Database migration system using Alembic
"""
import os
from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.environment import EnvironmentContext
from alembic.runtime.migration import MigrationContext

def get_alembic_config() -> Config:
    """Get Alembic configuration for the current environment."""
    # Get the directory where this file is located
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Path to alembic.ini (should be in the same directory as this file)
    alembic_ini_path = os.path.join(current_dir, 'alembic.ini')

    # Create config if it doesn't exist
    if not os.path.exists(alembic_ini_path):
        create_alembic_config(alembic_ini_path)

    config = Config(alembic_ini_path)

    # Set the script location to our migrations directory
    script_location = os.path.join(current_dir, 'migrations')
    if not os.path.exists(script_location):
        os.makedirs(script_location)

    config.set_main_option('script_location', script_location)

    # Set database URL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        database_url = "postgresql://investment_hub_user:HthtLQ7nwPVwwKuyHAL6gfMOUVtGgG5m@dpg-d2v0j4buibrs7384kr80-a.virginia-postgres.render.com/investment_hub_9nuh"

    config.set_main_option('sqlalchemy.url', database_url)

    return config

def create_alembic_config(alembic_ini_path: str):
    """Create a basic alembic.ini configuration file."""
    alembic_ini_content = """# A generic, single database configuration.

[alembic]
# path to migration scripts
script_location = migrations

# template used to generate migration file names; The default value is %%(rev)s_%%(slug)s
# Uncomment the line below if you want the files to be prepended with date and time
# see https://alembic.sqlalchemy.org/en/latest/tutorial.html#editing-the-ini-file for all available tokens
# file_template = %%(year)d_%%(month).2d_%%(day).2d_%%(hour).2d%%(minute).2d_%%(second).2d_%%(rev)s_%%(slug)s

# sys.path path, will be prepended to sys.path if present.
# defaults to the current working directory.
prepend_sys_path = .

# timezone to use when rendering the date within the migration file
# as well as the filename.
# If specified, requires the python-dateutil library that most platforms have pre-installed.
# Uncomment and set to UTC if you want UTC timestamps in migration files
# timezone = UTC

# max. 1024 characters
# the output encoding used when revision files are written from script.py.mako
output_encoding = utf-8

# sqlalchemy.url = driver://user:pass@localhost/dbname

[post_write_hooks]
# post_write_hooks defines scripts or Python functions that are called
# on newly generated revision scripts.  See the documentation for further
# detail and examples

# format using "black" - use the console_scripts runner, against the "black" entrypoint
# hooks = black
# black.type = console_scripts
# black.entrypoint = black
# black.options = -l 79

# Logging configuration
[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
qualname = sqlalchemy.engine
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
"""

    with open(alembic_ini_path, 'w') as f:
        f.write(alembic_ini_content)

def init_migrations():
    """Initialize Alembic migrations for the current project."""
    config = get_alembic_config()

    try:
        # Check if migrations directory already has content
        script = ScriptDirectory.from_config(config)
        if script.get_current_head():
            print("Migrations already initialized")
            return

        print("Initializing Alembic migrations...")

        # Create initial migration
        command.revision(config, message="Initial migration", rev_id="initial")

        print("✓ Alembic migrations initialized successfully")
        print("✓ Initial migration created")

    except Exception as e:
        print(f"Error initializing migrations: {e}")
        raise

def create_migration(message: str = "Database changes"):
    """Create a new migration for database schema changes."""
    config = get_alembic_config()

    try:
        print(f"Creating migration: {message}")

        # Generate new migration
        command.revision(config, message=message, autogenerate=True)

        print("✓ Migration created successfully")

    except Exception as e:
        print(f"Error creating migration: {e}")
        raise

def upgrade_database(revision: str = "head"):
    """Upgrade database to the specified revision."""
    config = get_alembic_config()

    try:
        print(f"Upgrading database to revision: {revision}")

        # Apply migrations
        command.upgrade(config, revision)

        print("✓ Database upgraded successfully")

    except Exception as e:
        print(f"Error upgrading database: {e}")
        raise

def downgrade_database(revision: str = "-1"):
    """Downgrade database to the specified revision."""
    config = get_alembic_config()

    try:
        print(f"Downgrading database to revision: {revision}")

        # Downgrade migration
        command.downgrade(config, revision)

        print("✓ Database downgraded successfully")

    except Exception as e:
        print(f"Error downgrading database: {e}")
        raise

def show_current_revision():
    """Show the current database revision."""
    config = get_alembic_config()

    try:
        # Get current revision
        script = ScriptDirectory.from_config(config)

        # Get database revision
        with EnvironmentContext(config, script) as env:
            connection = env.bind.connect()
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()

        print(f"Current database revision: {current_rev}")

        # Show available revisions
        print("Available revisions:")
        for revision in script.walk_revisions():
            current = " (current)" if revision.revision == current_rev else ""
            print(f"  {revision.revision} - {revision.doc}{current}")

    except Exception as e:
        print(f"Error getting current revision: {e}")
        raise

def stamp_database(revision: str):
    """Stamp database with a specific revision (without running migrations)."""
    config = get_alembic_config()

    try:
        print(f"Stamping database with revision: {revision}")

        # Stamp database
        command.stamp(config, revision)

        print("✓ Database stamped successfully")

    except Exception as e:
        print(f"Error stamping database: {e}")
        raise

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python migrations.py <command>")
        print("Commands:")
        print("  init      - Initialize migrations")
        print("  migrate   - Create new migration")
        print("  upgrade   - Upgrade database")
        print("  downgrade - Downgrade database")
        print("  current   - Show current revision")
        print("  stamp     - Stamp database with revision")
        sys.exit(1)

    command = sys.argv[1]

    if command == "init":
        init_migrations()
    elif command == "migrate":
        message = sys.argv[2] if len(sys.argv) > 2 else "Database changes"
        create_migration(message)
    elif command == "upgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "head"
        upgrade_database(revision)
    elif command == "downgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
        downgrade_database(revision)
    elif command == "current":
        show_current_revision()
    elif command == "stamp":
        revision = sys.argv[2] if len(sys.argv) > 2 else "head"
        stamp_database(revision)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
