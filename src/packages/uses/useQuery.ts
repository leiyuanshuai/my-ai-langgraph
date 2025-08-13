import qs from "qs";
import {useLocation} from "react-router";

export function useQuery() {

  const location = useLocation();

  const search = location.search.charAt(0) === '?' ? location.search.slice(1) : location.search;

  return qs.parse(search);
}
