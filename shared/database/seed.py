"""
Database seeding script for the investment hub application.
This script populates the database with initial data required for the application to function.
"""
import os
import sys
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from shared.database.connection import SessionLocal, test_connection, create_tables
from shared.database.models import User, Portfolio, Subscription, SubscriptionPlan

def seed_subscription_plans(db_session):
    """Create initial subscription plans."""
    print("Seeding subscription plans...")

    plans_data = [
        {
            "name": "Free",
            "description": "Basic features for getting started",
            "price_monthly": 0,
            "price_yearly": 0,
            "features": [
                "Basic portfolio tracking",
                "Limited market data",
                "Community support"
            ],
            "max_portfolios": 1,
            "max_holdings_per_portfolio": 10,
            "is_active": True,
        },
        {
            "name": "Premium",
            "description": "Advanced features for serious investors",
            "price_monthly": 29,
            "price_yearly": 299,
            "features": [
                "Unlimited portfolios",
                "Advanced analytics",
                "Priority support",
                "Real-time market data",
                "Risk assessment tools",
                "Portfolio optimization"
            ],
            "max_portfolios": -1,  # Unlimited
            "max_holdings_per_portfolio": 100,
            "is_active": True,
        },
        {
            "name": "Professional",
            "description": "Complete solution for investment professionals",
            "price_monthly": 99,
            "price_yearly": 999,
            "features": [
                "Everything in Premium",
                "White-label solutions",
                "API access",
                "Dedicated support",
                "Custom integrations",
                "Advanced reporting"
            ],
            "max_portfolios": -1,  # Unlimited
            "max_holdings_per_portfolio": 1000,
            "is_active": True,
        }
    ]

    for plan_data in plans_data:
        # Check if plan already exists
        existing_plan = db_session.query(SubscriptionPlan).filter(
            SubscriptionPlan.name == plan_data["name"]
        ).first()

        if not existing_plan:
            plan = SubscriptionPlan(**plan_data)
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
            Portfolio.user_id == portfolio_data["user_id"],
            Portfolio.name == portfolio_data["name"]
        ).first()

        if not existing_portfolio:
            portfolio = Portfolio(
                **portfolio_data,
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
        existing_subscription = db_session.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).first()

        if not existing_subscription:
            # Get the free plan
            free_plan = next((plan for plan in plans if plan.price_monthly == 0), None)
            if free_plan:
                subscription = Subscription(
                    user_id=user.id,
                    plan_id=free_plan.id,
                    status="active",
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
