import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt'
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo : Repository<User>){}
  async create(createUserDto: CreateUserDto) : Promise<User> {
      const existEmail = await this.repo.findOne({where : {email : createUserDto.email}}) 
      if(existEmail){
        throw new ConflictException('User with this email already exist');
      }

      const saltRound = 10;
      const password = await bcrypt.hash(createUserDto.password, saltRound);

      const newUser = this.repo.create({
        ...createUserDto,
        password,
      });

      return await this.repo.save(newUser)
  }

  async findAll() : Promise<User[]>{
    return await this.repo.find();
  }

  async findOne(id: string):Promise<User> {
    const user = await this.repo.findOne({where : {id}})
    if(!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
