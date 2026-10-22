import { describe, expect, it } from 'vitest';
import { parseAssistantCreateAction } from '../lib/assistant-actions';

describe('parseAssistantCreateAction', () => {
  it.each([
    ['Create a task called Finish the proposal', { type: 'task', title: 'Finish the proposal' }],
    ['can you create me a task to learn AI', { type: 'task', title: 'learn AI' }],
    ['Would you add me a goal named Build a daily reading habit?', { type: 'goal', title: 'Build a daily reading habit' }],
    ['please add goal: Run my first 10K', { type: 'goal', title: 'Run my first 10K' }],
    ['Make a task to call Sam.', { type: 'task', title: 'call Sam' }],
  ])('parses explicit create command %s', (input, expected) => {
    expect(parseAssistantCreateAction(input)).toEqual(expected);
  });

  it.each([
    'What task should I do today?',
    'I need to create a goal someday',
    'Create a task',
    'Delete the task called Finish the proposal',
    'Create a goal titled x'.replace('x', 'x'.repeat(161)),
  ])('does not treat ambiguous or invalid chat as a mutation: %s', (input) => {
    expect(parseAssistantCreateAction(input)).toBeNull();
  });

  it('supports goal creation requests too', () => {
    expect(parseAssistantCreateAction('Create a goal named Learn conversational Spanish'))
      .toEqual({ type: 'goal', title: 'Learn conversational Spanish' });
  });
});
