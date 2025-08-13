import Axios from "axios";
import env from "../../env/env";

export const http = Axios.create({
  baseURL: env.baseURL,
});
