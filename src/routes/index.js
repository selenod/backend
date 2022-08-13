import welcome from './welcome.js';
import user from './user.js';
import project from './project.js';

export default (app) => {
  app.use('/', welcome);
  app.use('/user', user);
  app.use('/project', project);
};
