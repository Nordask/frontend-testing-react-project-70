import {
  render, screen, within, waitFor,
} from '@testing-library/react';
import toDoApp from '@hexlet/react-todo-app-with-backend';

const INITIAL_DATA = {
  currentListId: 1,
  lists: [
    { id: 1, name: 'First type tasks', removable: false },
    { id: 2, name: 'Second type tasks', removable: true },
  ],
  tasks: [
    {
      id: 1,
      listId: 1,
      text: 'Task 1',
      completed: false,
    },
    {
      id: 2,
      listId: 1,
      text: 'Task 2',
      completed: false,
    },
    {
      id: 3,
      listId: 2,
      text: 'Task 1',
      completed: false,
    },
  ],
};

describe('test react-todo-app-with-backend', () => {
  it('should display to-do list', () => {
    const virtualDom = toDoApp(INITIAL_DATA);
    render(virtualDom);

    console.log('qq1', virtualDom);
  });
});
