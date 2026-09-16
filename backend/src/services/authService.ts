import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { generateToken } from '../config/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      school: true,
      parent: {
        include: {
          students: {
            include: {
              bus: true,
            },
          },
        },
      },
      teacher: true,
      driver: {
        include: {
          bus: {
            include: {
              route: {
                include: {
                  stops: {
                    orderBy: { sequence: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      school: true,
      parent: {
        include: {
          students: {
            include: {
              bus: {
                include: {
                  driver: {
                    include: {
                      user: { select: { name: true } },
                    },
                  },
                  route: {
                    include: {
                      stops: { orderBy: { sequence: 'asc' } },
                    },
                  },
                },
              },
              attendances: {
                orderBy: { date: 'desc' },
                take: 5,
              },
            },
          },
        },
      },
      teacher: true,
      driver: {
        include: {
          bus: {
            include: {
              route: {
                include: {
                  stops: { orderBy: { sequence: 'asc' } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
