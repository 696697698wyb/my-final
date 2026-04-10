import axios from "axios"

export function predictCVE(cve){

  return axios.get(

    "http://127.0.0.1:8000/cve/",

    {

      params:{
        cve:cve
      }

    }

  )

}
