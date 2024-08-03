import { setupServer } from 'msw/node';
import { rest } from 'msw';

const URL = 'http://localhost/api/v1';
export const createPath = (...paths) => [URL, ...paths].join('/');

const runServer = (initialState) => {
  let { tasks, lists } = initialState;

  const handlers = [
    rest.post(createPath('lists', ':id', 'tasks'), (req, res, ctx) => {
      const mockedTask = {
        completed: false,
        id: new Date().getTime(),
        listId: Number(req.params.id),
        text: req.body.text,
      };

      tasks.push(mockedTask);
      ctx.delay();
      return res(ctx.json(mockedTask));
    }),
  ];

  return setupServer(...handlers);
};

export default runServer;
