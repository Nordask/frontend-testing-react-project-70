import toDoApp from '@hexlet/react-todo-app-with-backend';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import {
  render, waitFor, within,
} from '@testing-library/react';
import runServer from '../mocks';

const TASK_1 = 'Task 1';
const TASK_2 = 'Task 2';
const LIST_1 = 'First type tasks';
const LIST_2 = 'Second type tasks';

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

describe('toDoApp tests', () => {
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
    it('it should add new tasks', async () => {
      const virtualDom = toDoApp(getDummyData());
      const { getByTestId, getByText } = render(virtualDom);

      const firstTaskName = 'First';
      const secondTaskName = 'Second';

      const taskForm = getByTestId('task-form');
      const input = within(taskForm).getByRole('textbox', { name: 'New task' });
      const submit = within(taskForm).getByRole('button', { name: 'Add' });

      userEvent.type(input, 'launched');
      userEvent.click(getByText('Hexlet Todos'));

      await waitFor(() => {
        expect(input.getAttribute('class')?.split(' ')?.includes('is-valid')).toBeTruthy();
      });

      userEvent.clear(input);
      userEvent.click(submit);

      await waitFor(() => {
        expect(input.getAttribute('class')?.split(' ')?.includes('is-invalid')).toBeTruthy();
        expect(getByText('Required!')).toBeTruthy();
      });

      userEvent.type(input, firstTaskName);
      userEvent.click(submit);

      expect(input.getAttribute('readonly')).toBe('');
      expect(submit.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        const ul = getByTestId('tasks');
        expect(within(ul).getAllByText(firstTaskName)).toHaveLength(1);
      });

      expect(input.getAttribute('readonly')).toBeNull();
      expect(submit.getAttribute('readonly')).toBeNull();

      userEvent.type(input, secondTaskName);
      userEvent.click(submit);

      expect(input.getAttribute('readonly')).toBe('');
      expect(submit.getAttribute('disabled')).toBe('');

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
      const { getByTestId, getByText } = render(virtualDom);

      const ul = getByTestId('tasks');
      const removeButtons = within(ul).getAllByRole('button', { name: 'Remove' });
      const [firstButton, secondButton] = removeButtons;

      expect(within(ul).getAllByRole('listitem')).toHaveLength(2);
      expect(removeButtons).toHaveLength(2);
      expect(within(ul).getByText(TASK_1)).toBeTruthy();
      expect(within(ul).getByText(TASK_2)).toBeTruthy();

      userEvent.click(firstButton);
      expect(firstButton.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        expect(within(ul).queryByText(TASK_1)).toBeNull();
        expect(within(ul).getAllByRole('listitem')).toHaveLength(1);
      });

      userEvent.click(secondButton);
      expect(secondButton.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        expect(getByText('Tasks list is empty')).toBeTruthy();
      });
    });

    it('should complete tasks', async () => {
      const virtualDom = toDoApp(getDummyData());
      const { getByTestId, getByLabelText } = render(virtualDom);

      const ul = getByTestId('tasks');
      const firstTask = getByLabelText(TASK_1);
      const secondTask = getByLabelText(TASK_2);

      userEvent.click(firstTask);
      expect(firstTask.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        expect(firstTask.getAttribute('disabled')).toBeNull();
        expect(ul.querySelectorAll('s')).toHaveLength(1);
      });

      userEvent.click(secondTask);
      expect(secondTask.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        expect(secondTask.getAttribute('disabled')).toBeNull();
        expect(ul.querySelectorAll('s')).toHaveLength(2);
      });

      userEvent.click(firstTask);
      userEvent.click(secondTask);

      expect(firstTask.getAttribute('disabled')).toBe('');
      expect(secondTask.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        expect(secondTask.getAttribute('disabled')).toBeNull();
        expect(ul.querySelectorAll('s')).toHaveLength(0);
      });
    });
  });

  describe('Lists', () => {
    it('should add new lists', async () => {
      const virtualDom = toDoApp(getDummyData());
      const { getByTestId, getByText } = render(virtualDom);

      const firstListName = 'First List';
      const secondListName = 'Second List';

      const listForm = getByTestId('list-form');
      const input = within(listForm).getByRole('textbox', { name: 'New list' });
      const submit = within(listForm).getByRole('button', { name: 'add list' });

      expect(getByText(LIST_1).getAttribute('class')?.split(' ')?.includes('link-primary'));

      userEvent.type(input, 'lineage');
      userEvent.click(getByText('Hexlet Todos'));

      await waitFor(() => {
        expect(input.getAttribute('class')?.split(' ')?.includes('is-valid')).toBeTruthy();
      });

      userEvent.clear(input);
      userEvent.click(submit);

      await waitFor(() => {
        expect(input.getAttribute('class')?.split(' ')?.includes('is-invalid')).toBeTruthy();
        expect(getByText('Required!')).toBeTruthy();
      });

      userEvent.type(input, firstListName);
      userEvent.click(submit);

      expect(input.getAttribute('readonly')).toBe('');
      expect(submit.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        const ul = getByTestId('lists');
        expect(within(ul).getAllByText(firstListName)).toHaveLength(1);
        expect(getByText('Tasks list is empty')).toBeTruthy();
        expect(getByText(firstListName).getAttribute('class')?.split(' ')?.includes('link-primary')).toBeTruthy();
        expect(getByText(LIST_1).getAttribute('class')?.split(' ')?.includes('link-secondary')).toBeTruthy();
      });

      userEvent.type(input, secondListName);
      userEvent.click(submit);

      expect(input.getAttribute('readonly')).toBe('');
      expect(submit.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        const ul = getByTestId('lists');
        expect(within(ul).getAllByText(secondListName)).toHaveLength(1);
      });

      userEvent.type(input, secondListName);
      userEvent.click(submit);

      await waitFor(() => {
        const ul = getByTestId('lists');
        expect(within(ul).getAllByText(secondListName)).toHaveLength(1);
      });

      expect(within(listForm).getByText(`${secondListName} already exists`)).toBeTruthy();
    });

    it('it should delete', async () => {
      const virtualDom = toDoApp(getDummyData());
      const { getByTestId } = render(virtualDom);

      const ul = getByTestId('lists');
      const removeButton = within(ul).getByRole('button', { name: 'remove list' });

      expect(within(ul).getAllByRole('listitem')).toHaveLength(2);
      expect(within(ul).getByText(LIST_1)).toBeTruthy();
      expect(within(ul).getByText(LIST_2)).toBeTruthy();

      userEvent.click(removeButton);
      expect(removeButton.getAttribute('disabled')).toBe('');

      await waitFor(() => {
        expect(within(ul).getAllByRole('listitem')).toHaveLength(1);
        expect(within(ul).queryByText('secondary')).toBeNull();
      });
    });
  });
});
