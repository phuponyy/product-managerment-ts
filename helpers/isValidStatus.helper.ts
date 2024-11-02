const validStatuses: Array<string> = [
  "initial",
  "doing",
  "finish",
  "pending",
  "notFinish",
];
const isValidStatus = (status: string): boolean => {
  return validStatuses.includes(status);
};

export default isValidStatus;
