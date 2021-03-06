export const ApiServiceMock = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
});

export const UsersServiceMock = () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUserById: jest.fn(),
  disableUser: jest.fn(),
  createUser: jest.fn(),
});
export const ProgramsServiceMock = () => ({
  getAllPrograms: jest.fn(),
  getProgramById: jest.fn(),
  updateProgramById: jest.fn(),
  disableProgram: jest.fn(),
  getAvailableUsersFor: jest.fn(),
});
