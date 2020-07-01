import { IProgram, IValidatedRecordedProgram } from "../models/types";
import { IBaseApiService } from "./base.api.service";

export interface IProgramsService {
  getAllPrograms(): Promise<IProgram[]>;
  getProgramById(id: IProgram["id"]): Promise<IProgram>;
  updateProgramById(id: IProgram["id"] | string, data: any): Promise<IProgram>;
  disableProgram(id: IProgram["id"]): Promise<IProgram>;
}

export class ProgramsService implements IProgramsService {
  constructor(private api: IBaseApiService) {}

  public async getAllPrograms() {
    const response = await this.api.get<IProgram[]>("/programs");
    return response.data;
  }

  public async getProgramById(id: IProgram["id"]) {
    const response = await this.api.get<IProgram>(`/programs/${id}`);
    return response.data;
  }

  public async updateProgramById(id: IProgram["id"], data: any) {
    const response = await this.api.put<IProgram>(`/programs/${id}`, data);
    return response.data;
  }

  public async disableProgram(id: IProgram["id"]) {
    const response = await this.api.delete<IProgram>(`/programs/${id}`);
    return response.data;
  }
  public async getRecordedShow(url: string) {
    const response = await this.api.get<IValidatedRecordedProgram>(
      "/admin/programs/recordings/validate"
    );
    return response.data;
  }
}
