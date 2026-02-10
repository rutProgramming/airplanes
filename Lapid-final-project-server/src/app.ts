
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import airplanesRouter from './routers/airplanes.router';

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

router.use('/api', airplanesRouter.routes(), airplanesRouter.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
