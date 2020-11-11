import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './tasks.entity';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.taskRepository.findOne(id);

    if (!found) throw new NotFoundException(`Task with ID ${id} not found`);

    return found;
  }

  async createTask(crateTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(crateTaskDto, user);
  }

  async deleteTask(id: number) {
    const thisTask = await this.getTaskById(id);
    thisTask.remove();
    //More performance below
    // const result = await this.taskRepository.delete(id);
    // if (result.affected === 0)
    //   throw new NotFoundException(`Task with ID ${id} not found`);
  }

  async updateTaskStatus(id: number, status: TaskStatus) {
    const thisTask = await this.getTaskById(id);
    thisTask.status = status;
    await thisTask.save();
    return thisTask;
  }

  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  // getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
  //   const { status, search } = filterDto;
  //   let tasks = this.getAllTasks();
  //   if (status) {
  //     tasks = tasks.filter(task => task.status === status);
  //   }
  //   if (search) {
  //     tasks = tasks.filter(
  //       task => task.title.includes(search) || task.desc.includes(search),
  //     );
  //   }
  //   return tasks;
  // }
}
