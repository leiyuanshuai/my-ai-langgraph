import Axios from "axios";
import env from "../../env/env";

export const aiHttp = Axios.create({
  baseURL: env.baseURL,
});

export const http = Axios.create({
  baseURL: env.resumeBaseURL,
});
