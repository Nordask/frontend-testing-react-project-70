import {
  render, waitFor,
} from '@testing-library/react';
import toDoApp from '@hexlet/react-todo-app-with-backend';

const DUMMY_DATA = {
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
  it('should display to-do list', async () => {
    const virtualDom = toDoApp(DUMMY_DATA);
    const { queryAllByText, queryAllByRole } = render(virtualDom);

    await waitFor(() => {
      expect(queryAllByText('Hexlet Todos')).toHaveLength(1);
      expect(queryAllByText('Lists')).toHaveLength(1);
      expect(queryAllByText('Tasks')).toHaveLength(1);
      expect(queryAllByText('First type tasks')).toHaveLength(1);
      expect(queryAllByText('Second type tasks')).toHaveLength(1);
      expect(queryAllByRole('button', { name: 'add list' })).toHaveLength(1);
      expect(queryAllByRole('textbox', { name: 'New list' })).toHaveLength(1);
      expect(queryAllByRole('button', { name: 'Add' })).toHaveLength(1);
      expect(queryAllByRole('textbox', { name: 'New task' })).toHaveLength(1);
    });
  });
});
