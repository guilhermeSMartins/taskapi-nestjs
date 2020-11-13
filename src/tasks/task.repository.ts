import { Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './tasks.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, desc } = createTaskDto;

    const task = new Task();
    task.title = title;
    task.desc = desc;
    task.status = TaskStatus.OPEN;
    task.user = user;
    await task.save();

    delete task.user;
    return task;
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) query.andWhere('task.status = :status', { status });
    if (search)
      query.andWhere('task.title LIKE :search OR task.desc LIKE :search', {
        search: `%${search}%`,
      });

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (e) {
      this.logger.error(
        `Failed to get tasks for user ${user.username}, DTO: ${JSON.stringify(
          filterDto,
        )}`,
        e.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
