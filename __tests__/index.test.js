import toDoApp from '@hexlet/react-todo-app-with-backend';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import {
  render, screen, within, waitFor,
} from '@testing-library/react';
import runServer from '../mocks';


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

let virtualDom;
let server;

describe('Core', () => {
  beforeEach(() => {
    server = runServer(DUMMY_DATA);
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

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

  describe('Tasks', () => {
    it('it should add new tasks', async () => {
      virtualDom = toDoApp(DUMMY_DATA);
      const { getByTestId, getByText, debug } = render(virtualDom);

      const firstTaskName = 'First';
      const secondTaskName = 'Second';

      const taskForm = getByTestId('task-form');
      const input = within(taskForm).getByRole('textbox', { name: 'New task' });
      const submit = within(taskForm).getByRole('button', { name: 'Add' });

      userEvent.type(input, 'launched');
      userEvent.click(getByText('Hexlet Todos'));

      await waitFor(() => {
        expect(input.getAttribute("class")?.split(' ')?.includes('is-valid')).toBeTruthy();
      });

      userEvent.clear(input);
      userEvent.click(submit);

      await waitFor(() => {
        expect(input.getAttribute("class")?.split(' ')?.includes('is-invalid')).toBeTruthy();
        expect(getByText('Required!')).toBeTruthy();
      });

      userEvent.type(input, firstTaskName);
      userEvent.click(submit);

      expect(input.getAttribute('readonly')).toBe("");
      expect(submit.getAttribute('disabled')).toBe("");

      await waitFor(() => {
        const ul = getByTestId('tasks');
        expect(within(ul).getAllByText(firstTaskName)).toHaveLength(1);
      });

      expect(input.getAttribute('readonly')).toBeNull();
      expect(submit.getAttribute('readonly')).toBeNull();

      userEvent.type(input, secondTaskName);
      userEvent.click(submit);

      expect(input.getAttribute('readonly')).toBe("");
      expect(submit.getAttribute('disabled')).toBe("");

      await waitFor(() => {
        const ul = getByTestId('tasks');
        expect(within(ul).getAllByText(secondTaskName)).toHaveLength(1);
      });

      userEvent.type(input, secondTaskName);
      userEvent.click(submit);

      await waitFor(() => {
        const ul = getByTestId('tasks');
        expect(within(ul).getAllByText(secondTaskName)).toHaveLength(1);
      });

      expect(within(taskForm).getByText(`${secondTaskName} already exists`)).toBeTruthy();
    });
  });
});
