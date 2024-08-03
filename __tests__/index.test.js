import toDoApp from '@hexlet/react-todo-app-with-backend';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import {
  render, screen, within, waitFor,
} from '@testing-library/react';
import { cloneDeep } from 'lodash';
import runServer from '../mocks';


const TASK_1 = 'Task 1';
const TASK_2 = 'Task 2';

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
      text: TASK_1,
      completed: false,
    },
    {
      id: 2,
      listId: 1,
      text: TASK_2,
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

const getDummyData = () => (cloneDeep(DUMMY_DATA));

let server;

describe('Core', () => {
  it('should display to-do list', async () => {
    const virtualDom = toDoApp(getDummyData());
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
    beforeEach(() => {
      server = runServer(getDummyData());
      server.listen();
    });
  
    afterEach(() => {
      server.resetHandlers();
    });
  
    afterAll(() => {
      server.close();
    });

    it('it should add new tasks', async () => {
      const virtualDom = toDoApp(getDummyData());
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

    it('should delete tast', async () => {
      const virtualDom = toDoApp(getDummyData());
      const { getByTestId, getByText, debug } = render(virtualDom);

      const ul = getByTestId('tasks');
      const removeButtons = within(ul).getAllByRole('button', { name: 'Remove' });
      const [firstButton, secondButton] = removeButtons;

      expect(within(ul).getAllByRole('listitem')).toHaveLength(2);
      expect(removeButtons).toHaveLength(2);
      expect(within(ul).getByText(TASK_1)).toBeTruthy();
      expect(within(ul).getByText(TASK_2)).toBeTruthy();

      userEvent.click(firstButton);
      expect(firstButton.getAttribute('disabled')).toBe("");

      await waitFor(() => {
        expect(within(ul).queryByText(TASK_1)).toBeNull();
        expect(within(ul).getAllByRole('listitem')).toHaveLength(1);
      });

      userEvent.click(secondButton);
      expect(secondButton.getAttribute('disabled')).toBe("");

      await waitFor(() => {
        expect(getByText('Tasks list is empty')).toBeTruthy();
      });
    });
  });
});
