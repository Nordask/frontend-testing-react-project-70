import { setupServer } from 'msw/node';
import { rest } from 'msw';

const URL = 'http://localhost/api/v1';
const createPath = (...paths) => [URL, ...paths].join('/');

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
    rest.delete(createPath('tasks', ':id'), (req, res, ctx) => {
      tasks = tasks.filter((task) => task.id !== req.params.id);
      ctx.delay();
      return res(ctx.status(200));
    }),
    rest.patch(createPath('tasks', ':id'), (req, res, ctx) => {
      const currentTask = tasks.find((task) => task.id === Number(req.params.id));
      const updatedTask = { ...currentTask, completed: req.body.completed };
      tasks = tasks.filter((task) => task.id !== currentTask);
      tasks.push(updatedTask);
      ctx.delay();
      return res(ctx.json(updatedTask));
    }),
    rest.post(createPath('lists'), (req, res, ctx) => {
      const mockedList = {
        id: new Date().getTime(),
        name: req.body.name,
        removable: true,
      };
      lists.push(mockedList);
      ctx.delay();
      return res(ctx.json(mockedList));
    }),
    rest.delete(createPath('lists', ':id'), (req, res, ctx) => {
      lists = lists.filter((list) => list.id !== req.params.id);
      tasks = tasks.filter((task) => task.listId !== req.params.id);
      ctx.delay();
      return res(ctx.status(200));
    }),
  ];

  return setupServer(...handlers);
};

export default runServer;
