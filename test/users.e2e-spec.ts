import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const TEST_USER = {
  id: 1,
  email: 'a@a.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  // it.todo('createAccount');
  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(`
      mutation {
        createAccount(input: {
          email: "${TEST_USER.email}"
          password: "${TEST_USER.password}"
          role: Owner
        }) {
          ok
          error
        }
      }`)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toEqual(true);
          expect(createAccount.error).toEqual(null);
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(`
      mutation {
        createAccount(input: {
          email: "${TEST_USER.email}"
          password: "${TEST_USER.password}"
          role: Owner
        }) {
          ok
          error
        }
      }`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toEqual(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });
  // it.todo('login');
  describe('login', () => {
    it('should login with correct credentials(token)', () => {
      return publicTest(`
      mutation {
        login(input: {
          email:"${TEST_USER.email}"
          password: "${TEST_USER.password}"
        }) {
          ok
          error
          token
        }
      }`)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });

    it('should not be able to login with wrong credentials(token)', () => {
      return publicTest(`
      mutation {
        login(input: {
          email:"${TEST_USER.email}"
          password: "fail~~"
        }) {
          ok
          error
          token
        }
      }`)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(false);
          expect(login.error).toEqual(expect.any(String));
          expect(login.token).toEqual(null);
        });
    });
  });
  // it.todo('userProfile');
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should see a user's profile", () => {
      return privateTest(`
      {
        userProfile(userId: ${userId}) {
          ok
          error
          user {
            id
          }
        }
      }`)
        .expect(200)
        .expect(res => {
          const {
            ok,
            error,
            user: { id },
          } = res.body.data.userProfile;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set(`X-JWT`, jwtToken)
        .send({
          query: `
        {
          userProfile(userId: 941213) {
            ok
            error
            user {
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect(res => {
          const { ok, error, user } = res.body.data.userProfile;
          expect(ok).toBe(false);
          expect(error).toBe('유저를 찾을 수 없습니다');
          expect(user).toBe(null);
        });
    });
  });

  // it.todo('me');
  describe('me', () => {
    it('shoud find my profile', () => {
      return privateTest(`
      {
        me {
          id
          email
        }
      }
      `)
        .expect(200)
        .expect(res => {
          const { id, email } = res.body.data.me;
          expect(id).toBe(TEST_USER.id);
          expect(email).toBe(TEST_USER.email);
        });
    });

    it('should not allow logged out user', () => {
      return publicTest(`
        {
          me {
            id
            email
          }
        }
      `)
        .expect(200)
        .expect(res => {
          const { errors } = res.body;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  // it.todo('editProfile');
  describe('editProfile', () => {
    it('should change email', () => {
      const NEW_EMAIL = 'b@b.com';

      return privateTest(`
      mutation {
        editProfile(input: {
          email: "${NEW_EMAIL}"
        }) {
          ok
          error
        }
      }`)
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.editProfile;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        })
        .then(() => {
          // should check new email
          return privateTest(`
              {
                me {
                  id
                  email
                }
              }
            `)
            .expect(200)
            .expect(res => {
              const { id, email } = res.body.data.me;
              expect(id).toBe(TEST_USER.id);
              expect(email).toBe(NEW_EMAIL);
            });
        });
    });

    it('should change password', () => {
      const NEW_PASSWORD = '941213';

      return privateTest(`
      mutation {
        editProfile(input: {
          password: "${NEW_PASSWORD}"
        }) {
          error
          ok
        }
      }
      `)
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.editProfile;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        })
        .then(() => {
          return privateTest(`
          {
            me {
              id
              email
            }
          }
        `).expect(200);
        });
    });
  });

  // it.todo('verifyEmail');
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return publicTest(`
      mutation {
        verifyEmail(input: {
          code: "${verificationCode}"
        }) {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.verifyEmail;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found', () => {
      return publicTest(`
      mutation {
        verifyEmail(input: {
          code: "fail_code"
        }) {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect(res => {
          const { ok, error } = res.body.data.verifyEmail;

          expect(ok).toEqual(false);
          expect(error).toEqual(expect.any(String));
        });
    });
  });
});
