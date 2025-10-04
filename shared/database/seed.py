"""
Database seeding script for the investment hub application.
This script populates the database with initial data required for the application to function.
"""
import os
import sys
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import our modules
# Note: This is an environment-specific fix for Codespaces/local run
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from shared.database.connection import SessionLocal, test_connection, create_tables
# Ensure UserSubscription is imported and Subscription is NOT
from shared.database.models import User, Portfolio, UserSubscription, SubscriptionPlan 

def seed_subscription_plans(db_session):
    """Create initial subscription plans."""
    print("Seeding subscription plans...")

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
            # Create a dictionary of only the column names
            plan_obj_data = {
                k: plan_data[k] for k in ["name", "description", "amount", "interval", "tier", "is_active"]
            }
            # Add metadata
            plan_obj_data["metadata_"] = plan_data["metadata"] 
            
            plan = SubscriptionPlan(**plan_obj_data)
            db_session.add(plan)
            print(f"  ✓ Created subscription plan: {plan_data['name']}")
        else:
            print(f"  - Subscription plan already exists: {plan_data['name']}")

    db_session.commit()

def seed_admin_user(db_session):
    """Create initial admin user."""
    print("Seeding admin user...")

    # Check if admin user already exists
    existing_admin = db_session.query(User).filter(
        User.email == "admin@investmenthub.com"
    ).first()

    if not existing_admin:
        # The password hash for "password" should be consistent
        admin_user = User(
            email="admin@investmenthub.com",
            first_name="System",
            last_name="Administrator",
            is_active=True,
            is_superuser=True,
            email_verified=True,
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeehkK/7C2.SvCjJg",  # "password"
        )
        db_session.add(admin_user)
        print("  ✓ Created admin user: admin@investmenthub.com")
    else:
        print("  - Admin user already exists")

    db_session.commit()

def seed_sample_users(db_session):
    """Create sample users for testing."""
    print("Seeding sample users...")

    sample_users = [
        {
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_active": True,
            "email_verified": True,
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeehkK/7C2.SvCjJg",  # "password"
        },
        {
            "email": "jane.smith@example.com",
            "first_name": "Jane",
            "last_name": "Smith",
            "is_active": True,
            "email_verified": True,
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeehkK/7C2.SvCjJg",  # "password"
        },
        {
            "email": "investor@example.com",
            "first_name": "Alex",
            "last_name": "Investor",
            "is_active": True,
            "email_verified": True,
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeehkK/7C2.SvCjJg",  # "password"
        }
    ]

    for user_data in sample_users:
        existing_user = db_session.query(User).filter(
            User.email == user_data["email"]
        ).first()

        if not existing_user:
            user = User(**user_data)
            db_session.add(user)
            print(f"  ✓ Created sample user: {user_data['email']}")
        else:
            print(f"  - Sample user already exists: {user_data['email']}")

    db_session.commit()

def seed_sample_portfolios(db_session):
    """Create sample portfolios for testing."""
    print("Seeding sample portfolios...")

    # Get users for portfolio creation
    users = db_session.query(User).filter(User.email_verified == True).all()

    if not users:
        print("  ⚠ No verified users found for portfolio creation")
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
            print(f"  ✓ Created portfolio: {portfolio_data['name']}")
        else:
            print(f"  - Portfolio already exists: {portfolio_data['name']}")

    db_session.commit()

def seed_sample_subscriptions(db_session):
    """Create sample subscriptions for testing."""
    print("Seeding sample subscriptions...")

    # Get users and plans
    users = db_session.query(User).filter(User.email_verified == True).all()
    plans = db_session.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()

    if not users or not plans:
        print("  ⚠ No users or plans found for subscription creation")
        return

    # Create free subscriptions for all users
    for user in users:
        # FIX: Changed 'Subscription' to 'UserSubscription'
        existing_subscription = db_session.query(UserSubscription).filter(
            UserSubscription.user_id == user.id,
            UserSubscription.status == "active"
        ).first()

        if not existing_subscription:
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
                print(f"  ✓ Created free subscription for: {user.email}")
        else:
            print(f"  - Active subscription already exists for: {user.email}")

    db_session.commit()

def main():
    """Main seeding function."""
    print("🚀 Starting database seeding...")

    # Test database connection
    if not test_connection():
        print("❌ Cannot connect to database. Please check your DATABASE_URL.")
        return 1

    # Create tables if they don't exist
    try:
        create_tables()
        print("✓ Database tables created/verified")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return 1

    try:
        with SessionLocal() as db:
            # Run all seeding functions
            seed_subscription_plans(db)
            seed_admin_user(db)
            seed_sample_users(db)
            seed_sample_portfolios(db)
            seed_sample_subscriptions(db)

        print("✅ Database seeding completed successfully!")
        print("\n📋 Summary:")
        print("  • Subscription plans created")
        print("  • Admin user created (admin@investmenthub.com)")
        print("  • Sample users created for testing")
        print("  • Sample portfolios created")
        print("  • Sample subscriptions created")
        print("\n🔐 Admin credentials:")
        print("  Email: admin@investmenthub.com")
        print("  Password: password")

        return 0

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
