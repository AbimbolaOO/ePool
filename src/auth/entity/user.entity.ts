import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: null, length: 64 })
  @Unique(['username'])
  username: string;

  @Column()
  email: string;

  @Column({ default: null })
  firstName: string;

  @Column({ default: null })
  lastName: string;

  @Column()
  middleName: string;

  @Column({ default: null })
  gender: string;

  @Column({ default: null })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isDeactivated: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true, default: null })
  archivedAt?: Date;
}
