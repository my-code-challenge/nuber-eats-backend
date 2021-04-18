import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'jwt/jwt.service';
import { MailService } from 'mail/mail.service';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>; // K?: T

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  // 테스트가 실행 되기 전에 beforeAll 실행
  // beforeAll
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User), // InjectRepository
          useValue: mockRepository(),
        }, // Mock(가짜) Repositofy
        {
          provide: getRepositoryToken(Verification), // InjectRepository
          useValue: mockRepository(),
        }, // Mock(가짜) Repositofy
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it.todo('createAccount');
  describe('createAccount', () => {
    const createAccountArgs: CreateAccountInput = {
      email: '',
      password: '',
      role: UserRole.Client,
    };
    it('should fail if exists', async () => {
      // promise function return => mockResolvedValue
      // function return => mockReturnValue
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '해당 이메일을 가진 사용자가 이미 존재합니다',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      // usersRepository.create 함수를 한번만 실행하도록 명령
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createAccount(createAccountArgs);

      expect(result).toEqual({
        ok: false,
        error: '계정을 생성할 수 없음',
      });
    });
  });

  // it.todo('login');
  describe('login', () => {
    const loginArgs = {
      email: 'aa@email.com',
      password: 'aa.password',
    };

    it('should fail if user does not exists', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(result).toEqual({
        ok: false,
        error: '유저를 찾을 수 없습니다',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      // console.log(result);

      expect(result).toEqual({
        ok: false,
        error: '잘못된 비밀번호 입니다',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      // console.log(result);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });

    it('should fail if not found user', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.login(loginArgs);

      // console.log('result', result);
      expect(result).toEqual({ ok: false, error: new Error() });
    });
  });

  // it.todo('findById');
  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);

      const result = await service.findById(findByIdArgs.id);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if not found user', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.findById(findByIdArgs.id);
      expect(result).toEqual({
        ok: false,
        error: '유저를 찾을 수 없습니다',
      });
    });
  });

  // it.todo('editProfile');
  describe('editProfile', () => {
    it('should change email', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const oldUser = {
        id: editProfileArgs.userId,
        email: 'bs@old.com',
        verified: true,
      };
      const newUser = {
        id: editProfileArgs.userId,
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        id: editProfileArgs.userId,
      });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith({
        user: { id: editProfileArgs.userId },
      });

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };

      usersRepository.findOne.mockResolvedValue({ password: 'old.password' });

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, {
        email: 'exception@ex.com',
      });
      expect(result).toEqual({
        ok: false,
        error: '프로필 수정이 불가능 합니다',
      });
    });
  });

  // it.todo('verifyEmail');
  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };

      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail(expect.any(String));

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.verifyEmail(expect.any(String));

      expect(result).toEqual({
        ok: false,
        error: '유효성(Verification)을 찾을 수 없습니다',
      });
    });

    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());

      const result = await service.verifyEmail(expect.any(String));

      expect(result).toEqual({
        ok: false,
        error: '유효성(Verification)을 찾을 수 없습니다',
      });
    });
  });
});
