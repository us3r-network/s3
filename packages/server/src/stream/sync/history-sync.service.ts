import { Injectable } from "@nestjs/common";
import type { Provider } from '@ethersproject/providers'
import { IJobQueue, JobQueue } from "../subscriber/job-queue";
import { SyncJobData } from "./constants";


@Injectable()
export default class HistorySyncService {
    private provider!: Provider;
    private readonly jobQueue!: IJobQueue<SyncJobData>; 

    constructor() {
        // TODO: pass in the job queue name
        this.jobQueue = new JobQueue('');
    }

    async init(provider: Provider): Promise<void> {
        this.provider = provider;
    }

    async startHistorySync(){
        
    }
    
}