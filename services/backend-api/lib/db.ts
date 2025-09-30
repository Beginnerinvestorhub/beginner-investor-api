import { PrismaClient } from '@prisma/client';
import { auth } from '../lib/firebase-admin';

const prisma = new PrismaClient();

// Middleware to check if user exists in database
export const ensureUserExists = async (uid: string, email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: uid }
    });

    if (!user) {
      // Get Firebase user details
      const firebaseUser = await auth.getUser(uid);
      
      // Create new user in database
      await prisma.user.create({
        data: {
          id: uid,
          email: email || firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          // Initialize with default preferences
          nudgePreferences: {
            create: {
              frequency: 'medium',
              types: ['educational', 'risk', 'opportunity'],
              activeHours: JSON.stringify({
                start: '09:00',
                end: '17:00',
                timezone: 'UTC'
              })
            }
          },
          // Initialize empty portfolio
          portfolio: {
            create: {
              totalValue: 0,
              cash: 0
            }
          },
          // Initialize learning progress
          learningProgress: {
            create: {
              completedModules: [],
              progress: 0
            }
          }
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return false;
  }
};

// Helper function to get user with related data
export const getUserWithData = async (uid: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id: uid },
      include: {
        portfolio: {
          include: {
            holdings: true
          }
        },
        learningProgress: true,
        nudgePreferences: true,
        watchlist: {
          include: {
            alerts: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export default prisma;