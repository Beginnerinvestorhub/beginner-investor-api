import os
import sys
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Add the parent directory to the path so we can import our modules
# Note: This is an environment-specific fix for Codespaces/local run
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from shared.database.connection import SessionLocal, test_connection, create_tables
# Ensure UserSubscription is imported and Subscription is NOT
from shared.database.models import User, Portfolio, UserSubscription, SubscriptionPlan 

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SeederConfig:
    """Configuration for the seeding process."""
    
    def __init__(self):
        self.admin_email = os.getenv('SEED_ADMIN_EMAIL', 'admin@investmenthub.com')
        self.admin_password = os.getenv('SEED_ADMIN_PASSWORD', 'changeme123!')
        self.sample_user_password = os.getenv('SEED_SAMPLE_PASSWORD', 'changeme123!')
        self.dry_run = os.getenv('SEED_DRY_RUN', 'false').lower() == 'true'
        self.log_level = os.getenv('SEED_LOG_LEVEL', 'INFO').upper()
        
        # Configure logger level
        logger.setLevel(getattr(logging, self.log_level, logging.INFO))
    
    def should_seed(self, entity_name: str) -> bool:
        """Check if a specific entity should be seeded based on environment variables."""
        env_var = f'SEED_{entity_name.upper()}'
        return os.getenv(env_var, 'true').lower() == 'true'

def get_password_hash(password: str) -> str:
    """Generate password hash for the given password."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    return pwd_context.hash(password)

def seed_subscription_plans(db_session, config: SeederConfig, dry_run: bool = False):
    """Create initial subscription plans."""
    logger.info("Seeding subscription plans...")

    # NOTE: You need to ensure that the PlanTier and BillingInterval enums from your 
    # subscription model are imported or available to correctly set these values.
    # Assuming they are available via the model import or you will update this data 
    # to use the enum values directly (e.g., tier="FREE", interval="month").
    # I'll use the string names consistent with the enum values from your model.
    plans_data = [
        {
            "name": "Free",
            "description": "Basic features for getting started",
            "amount": 0, # Changed from price_monthly
            "interval": "month",
            "tier": "FREE",
            "metadata": {
                "max_portfolios": 1,
                "max_holdings_per_portfolio": 10,
                "features": [
                    "Basic portfolio tracking",
                    "Limited market data",
                    "Community support"
                ],
            },
            "is_active": True,
        },
        {
            "name": "Premium",
            "description": "Advanced features for serious investors",
            "amount": 29.00, # Changed from price_monthly
            "interval": "month",
            "tier": "PREMIUM",
            "metadata": {
                "max_portfolios": -1,  # Unlimited
                "max_holdings_per_portfolio": 100,
                "features": [
                    "Unlimited portfolios",
                    "Advanced analytics",
                    "Priority support",
                    "Real-time market data",
                    "Risk assessment tools",
                    "Portfolio optimization"
                ],
            },
            "is_active": True,
        },
        # NOTE: You should add a yearly plan here if you want to seed it, but 
        # for simplicity, I'm keeping the seeding focused on monthly plans for now.
    ]
    
    # NOTE: In your SubscriptionPlan model, the columns are 'amount', 'interval', and 'tier'. 
    # Your seed data uses 'price_monthly', 'price_yearly', 'features', 'max_portfolios', and 
    # 'max_holdings_per_portfolio'. I am correcting the keys to match the model and moving 
    # plan-specific details (like features/limits) into the 'metadata' JSONB column.

    for plan_data in plans_data:
        # Check if plan already exists
        existing_plan = db_session.query(SubscriptionPlan).filter(
            SubscriptionPlan.name == plan_data["name"]
        ).first()

        if not existing_plan:
<<<<<<< HEAD
            if dry_run:
                logger.info(f"  [DRY RUN] Would create subscription plan: {plan_data['name']}")
                continue
                
            plan = SubscriptionPlan(**plan_data)
=======
            # Create a dictionary of only the column names
            plan_obj_data = {
                k: plan_data[k] for k in ["name", "description", "amount", "interval", "tier", "is_active"]
            }
            # Add metadata
            plan_obj_data["metadata_"] = plan_data["metadata"] 
            
            plan = SubscriptionPlan(**plan_obj_data)
>>>>>>> 94d29dab5d0cdd4270ed4b59294550e80e0283e7
            db_session.add(plan)
            logger.info(f"  ✓ Created subscription plan: {plan_data['name']}")
        else:
            logger.info(f"  - Subscription plan already exists: {plan_data['name']}")

    if not dry_run:
        db_session.commit()

def seed_admin_user(db_session, config: SeederConfig, dry_run: bool = False):
    """Create initial admin user."""
    logger.info("Seeding admin user...")

    # Check if admin user already exists
    existing_admin = db_session.query(User).filter(
        User.email == config.admin_email
    ).first()

    if not existing_admin:
<<<<<<< HEAD
        if dry_run:
            logger.info(f"  [DRY RUN] Would create admin user: {config.admin_email}")
            return
            
=======
        # The password hash for "password" should be consistent
>>>>>>> 94d29dab5d0cdd4270ed4b59294550e80e0283e7
        admin_user = User(
            email=config.admin_email,
            first_name="System",
            last_name="Administrator",
            is_active=True,
            is_superuser=True,
            email_verified=True,
            hashed_password=get_password_hash(config.admin_password),
        )
        db_session.add(admin_user)
        logger.info(f"  ✓ Created admin user: {config.admin_email}")
    else:
        logger.info(f"  - Admin user already exists: {config.admin_email}")

    if not dry_run:
        db_session.commit()

def seed_sample_users(db_session, config: SeederConfig, dry_run: bool = False):
    """Create sample users for testing."""
    logger.info("Seeding sample users...")

    sample_users = [
        {
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_active": True,
            "email_verified": True,
            "hashed_password": get_password_hash(config.sample_user_password),
        },
        {
            "email": "jane.smith@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "is_active": True,
            "email_verified": True,
            "hashed_password": get_password_hash(config.sample_user_password),
        },
        {
            "email": "investor@example.com",
            "first_name": "Alex",
            "last_name": "Investor",
            "is_active": True,
            "email_verified": True,
            "hashed_password": get_password_hash(config.sample_user_password),
        }
    ]

    for user_data in sample_users:
        existing_user = db_session.query(User).filter(
            User.email == user_data["email"]
        ).first()

        if not existing_user:
            if dry_run:
                logger.info(f"  [DRY RUN] Would create sample user: {user_data['email']}")
                continue
                
            user = User(**user_data)
            db_session.add(user)
            logger.info(f"  ✓ Created sample user: {user_data['email']}")
        else:
            logger.info(f"  - Sample user already exists: {user_data['email']}")

    if not dry_run:
        db_session.commit()

def seed_sample_portfolios(db_session, config: SeederConfig, dry_run: bool = False):
    """Create sample portfolios for testing."""
    logger.info("Seeding sample portfolios...")

    # Get users for portfolio creation
    users = db_session.query(User).filter(User.email_verified == True).all()

    if not users:
        logger.warning("  ⚠ No verified users found for portfolio creation")
        return

    sample_portfolios = [
        {
            "user_id": users[0].id,
            "name": "Growth Portfolio",
            "description": "Aggressive growth strategy focusing on tech stocks",
            "target_allocation": {
                "stocks": 80,
                "bonds": 15,
                "cash": 5
            }
        },
        {
            "user_id": users[0].id,
            "name": "Conservative Portfolio",
            "description": "Conservative approach with focus on stability",
            "target_allocation": {
                "stocks": 40,
                "bonds": 50,
                "cash": 10
            }
        }
    ]

    for portfolio_data in sample_portfolios:
        # Check if portfolio already exists for this user
        existing_portfolio = db_session.query(Portfolio).filter(
            Portfolio.owner_id == portfolio_data["user_id"], # Note: Changed user_id to owner_id here for consistency with your model
            Portfolio.name == portfolio_data["name"]
        ).first()

        if not existing_portfolio:
            if dry_run:
                logger.info(f"  [DRY RUN] Would create portfolio: {portfolio_data['name']}")
                continue
                
            portfolio = Portfolio(
                # Use owner_id to match your model structure
                owner_id=portfolio_data["user_id"],
                name=portfolio_data["name"],
                description=portfolio_data["description"],
                # Assuming 'target_allocation' maps to a JSONB column or similar
                target_allocation=portfolio_data["target_allocation"], 
                created_at=datetime.utcnow()
            )
            db_session.add(portfolio)
            logger.info(f"  ✓ Created portfolio: {portfolio_data['name']}")
        else:
            logger.info(f"  - Portfolio already exists: {portfolio_data['name']}")

    if not dry_run:
        db_session.commit()

def seed_sample_subscriptions(db_session, config: SeederConfig, dry_run: bool = False):
    """Create sample subscriptions for testing."""
    logger.info("Seeding sample subscriptions...")

    # Get users and plans
    users = db_session.query(User).filter(User.email_verified == True).all()
    plans = db_session.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()

    if not users or not plans:
        logger.warning("  ⚠ No users or plans found for subscription creation")
        return

    # Create free subscriptions for all users
    for user in users:
        # FIX: Changed 'Subscription' to 'UserSubscription'
        existing_subscription = db_session.query(UserSubscription).filter(
            UserSubscription.user_id == user.id,
            UserSubscription.status == "active"
        ).first()

        if not existing_subscription:
            if dry_run:
                logger.info(f"  [DRY RUN] Would create free subscription for: {user.email}")
                continue
                
            # Get the free plan
            # FIX: Use 'amount' or check 'tier' to find the Free plan
            free_plan = next((plan for plan in plans if plan.amount == 0), None)
            if free_plan:
                # FIX: Changed 'Subscription' to 'UserSubscription' and ensured 'status' matches Enum string
                subscription = UserSubscription(
                    user_id=user.id,
                    plan_id=free_plan.id,
                    status="active", # This string must match the SubscriptionStatus enum value
                    current_period_start=datetime.utcnow(),
                    current_period_end=datetime.utcnow() + timedelta(days=30),
                    cancel_at_period_end=False
                )
                db_session.add(subscription)
                logger.info(f"  ✓ Created free subscription for: {user.email}")
        else:
            logger.info(f"  - Active subscription already exists for: {user.email}")

    if not dry_run:
        db_session.commit()

def main():
    """Main seeding function."""
    import argparse

    parser = argparse.ArgumentParser(description='Database seeding script')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be seeded without making changes')
    parser.add_argument('--only', nargs='+', choices=['plans', 'admin', 'users', 'portfolios', 'subscriptions'],
                       help='Only seed specific entities')
    parser.add_argument('--skip', nargs='+', choices=['plans', 'admin', 'users', 'portfolios', 'subscriptions'],
                       help='Skip seeding specific entities')
    parser.add_argument('--log-level', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], default='INFO',
                       help='Set logging level')

    args = parser.parse_args()

    # Override config with command line arguments
    config = SeederConfig()
    if args.dry_run:
        config.dry_run = True
    if args.log_level:
        config.log_level = args.log_level
        logger.setLevel(getattr(logging, args.log_level, logging.INFO))

    logger.info("🚀 Starting database seeding...")

    # Test database connection
    if not test_connection():
        logger.error("❌ Cannot connect to database. Please check your DATABASE_URL.")
        return 1

    # Create tables if they don't exist
    try:
        create_tables()
        logger.info("✓ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return 1

    try:
        with SessionLocal() as db:
            # Determine what to seed based on arguments
            entities_to_seed = {
                'plans': config.should_seed('plans') and (not args.only or 'plans' in args.only) and (not args.skip or 'plans' not in args.skip),
                'admin': config.should_seed('admin') and (not args.only or 'admin' in args.only) and (not args.skip or 'admin' not in args.skip),
                'users': config.should_seed('users') and (not args.only or 'users' in args.only) and (not args.skip or 'users' not in args.skip),
                'portfolios': config.should_seed('portfolios') and (not args.only or 'portfolios' in args.only) and (not args.skip or 'portfolios' not in args.skip),
                'subscriptions': config.should_seed('subscriptions') and (not args.only or 'subscriptions' in args.only) and (not args.skip or 'subscriptions' not in args.skip),
            }

            # Run seeding functions based on configuration
            if entities_to_seed['plans']:
                seed_subscription_plans(db, config, config.dry_run)
            if entities_to_seed['admin']:
                seed_admin_user(db, config, config.dry_run)
            if entities_to_seed['users']:
                seed_sample_users(db, config, config.dry_run)
            if entities_to_seed['portfolios']:
                seed_sample_portfolios(db, config, config.dry_run)
            if entities_to_seed['subscriptions']:
                seed_sample_subscriptions(db, config, config.dry_run)

        if config.dry_run:
            logger.info("✅ Dry run completed! No changes were made to the database.")
        else:
            logger.info("✅ Database seeding completed successfully!")
            logger.info("\n📋 Summary:")
            logger.info("  • Subscription plans created")
            logger.info(f"  • Admin user created ({config.admin_email})")
            logger.info("  • Sample users created for testing")
            logger.info("  • Sample portfolios created")
            logger.info("  • Sample subscriptions created")
            logger.info(f"\n🔐 Admin credentials: {config.admin_email} / [configured password]")

        return 0

    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
