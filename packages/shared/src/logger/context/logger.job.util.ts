import { randomUUID } from 'crypto';
import { JobContextData } from '../logger.interface';
import { LoggerContext } from '../logger.context';

interface runJobOption {
  jobName: string;
  queueName?: string;
  jobId?: string;
  attempt?: number;
}

export async function runWithJobContext<T>(
  options: runJobOption,
  fn: () => Promise<T> | T,
): Promise<T> {
  const context: JobContextData = {
    type: 'job',
    jobId: options.jobId || randomUUID(),
    jobName: options.jobName,
    queueName: options.queueName,
    attempt: options.attempt,
  };
  return LoggerContext.run(context, async() => fn())
}
