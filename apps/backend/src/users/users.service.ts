import {InjectRedis} from '@nestjs-modules/ioredis';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from '@service/orm';
import {GraphQLError} from 'graphql/error';
import Redis from 'ioredis';
import {Repository} from 'typeorm';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService,
		@InjectRedis() private redis: Redis,
	) {}

	// Создание пользователя и возвращение токена
	async createUser(email: string, password: string): Promise<User> {
		const user = new User();
		user.email = email;
		user.password = await bcrypt.hash(password, 10);
		await this.userRepository.save(user);
		return user; // Возвращаем созданного пользователя
	}

	// Обновление пользователя
	async updateUser(
		id: number,
		email: string,
		password?: string,
	): Promise<User> {
		const user = await this.findById(id);
		if (!user) throw new Error('User not found');

		user.email = email;
		if (password) {
			user.password = await bcrypt.hash(password, 10);
		}

		return this.userRepository.save(user);
	}

	// Удаление пользователя
	async deleteUser(id: number): Promise<boolean> {
		const result = await this.userRepository.delete(id);
		return (result.affected ?? 0) > 0;
	}

	// Получение всех пользователей
	async findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	// Поиск пользователя по ID
	async findById(id: number): Promise<User | null> {
		return this.userRepository.findOne({where: {id}});
	}

	// Поиск пользователя по email
	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOne({where: {email}});
	}

	// Генерация токена для пользователя
	private generateToken(user: User) {
		const payload = {email: user.email, sub: user.id};
		return {access_token: this.jwtService.sign(payload)};
	}

	// Метод регистрации пользователя и возвращение токена
	async register(email: string, password: string) {
		const user = await this.createUser(email, password);
		return this.generateToken(user); // Возвращаем токен
	}

	// Метод логина пользователя и возвращение токена
	async login(email: string, password: string) {
		const user = await this.findByEmail(email);

		if (!user) {
			throw new Error('User not found');
		}

		if (!(await user.validatePassword(password))) {
			throw new Error('Invalid credentials');
		}

		return this.generateToken(user);
	}

	// Метод логина пользователя по токену и возвращение токена
	async loginByToken(token: string) {
		const userId = await this.redis.get(`login:${token}`);
		if (!userId) {
			throw new GraphQLError('Недействительный или истёкший токен', {
				extensions: {code: 'INVALID_TOKEN'},
			});
		}

		await this.redis.del(`login:${token}`); // одноразово

		const user = await this.userRepository.findOneBy({id: Number(userId)});
		if (!user) {
			throw new GraphQLError('Пользователь не найден', {
				extensions: {code: 'USER_NOT_FOUND'},
			});
		}

		const access_token = this.jwtService.sign({sub: user.id});
		return {access_token};
	}
}
