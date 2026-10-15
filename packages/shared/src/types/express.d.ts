import { Express } from "express";
import {User} from '@myapp/database'
declare global {
  namespace Express {
    interface Request {
      // user: {
      //   id: string;
      //   email: string;
      //   role: string;
      // };
      user?: User | any;
    }
  }
}
