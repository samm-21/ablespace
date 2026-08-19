import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './project.schema';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    TasksModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
