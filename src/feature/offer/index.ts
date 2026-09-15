import { create } from "./create";
import { remove } from "./delete";
import { get } from "./get";
import { list } from "./list";
import { update } from "./update";
import { uploadCv } from "./uploadCv";

export const offer = {
  create,
  update,
  delete: remove,
  list,
  get,
  uploadCv,
};
