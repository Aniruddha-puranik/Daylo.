import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { gsap } from 'gsap';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

vi.mock('gsap', () => ({ gsap: { context: (fn: () => void) => { fn(); return { revert: () => {} }; }, from: vi.fn(), to: vi.fn((_el, config) => config.onComplete?.()), registerPlugin: vi.fn(), utils: { toArray: () => [] }, fromTo: vi.fn() } }));
import HomePage from '../app/page';

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
function openWorkspace(){localStorage.setItem('daylo_name',JSON.stringify('Aniru'));localStorage.setItem('daylo_tour_seen','true');render(<HomePage/>);fireEvent.click(screen.getByRole('button',{name:/explore the workspace/i}));}

describe('responsive Daylo workspace interactions', () => {
  it('uses GSAP, manages notification inbox items, and creates automations', () => {
    vi.mocked(gsap.from).mockClear();
    localStorage.setItem('daylo_notifications',JSON.stringify([{id:'n1',message:'Water break reminder',createdAt:Date.now(),read:false},{id:'n2',message:'Your plan is ready',createdAt:Date.now(),read:true}]));
    openWorkspace();
    expect(gsap.from).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:/Notifications/}));
    expect(screen.getByRole('dialog',{name:'Notifications'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Mark unread: Your plan is ready'}));
    expect(JSON.parse(localStorage.getItem('daylo_notifications')||'[]').find((item:{id:string})=>item.id==='n2').read).toBe(false);
    fireEvent.click(screen.getByRole('button',{name:'Delete all'}));
    expect(JSON.parse(localStorage.getItem('daylo_notifications')||'[]')).toHaveLength(0);
    fireEvent.click(screen.getAllByRole('button',{name:'Automation'})[0]);
    fireEvent.click(screen.getByRole('button',{name:'New automation'}));
    fireEvent.change(screen.getByPlaceholderText('What task should Daylo create?'),{target:{value:'Review weekly plan'}});
    fireEvent.click(screen.getByRole('button',{name:'Save automation'}));
    expect(JSON.parse(localStorage.getItem('daylo_automations')||'[]')[0]).toMatchObject({title:'Review weekly plan',enabled:true,cadence:'weekdays'});
  });
  it('navigates between the application sections', () => {
    openWorkspace();
    for (const section of ['Tasks','Notes','Goals','Habits','Insights','Calendar','Automation','Settings']) {
      fireEvent.click(screen.getAllByRole('button',{name:section})[0]);
      expect(screen.getAllByRole('heading',{name:new RegExp(section,'i')}).length).toBeGreaterThan(0);
      if(section==='Calendar'){
        fireEvent.click(screen.getByRole('button',{name:'Day'}));
        expect(document.querySelector('.calendar')).toHaveClass('day-view');
        fireEvent.click(screen.getByRole('button',{name:'Week'}));
        expect(document.querySelector('.calendar')).not.toHaveClass('day-view');
      }
    }
  });
  it('creates, completes, deletes, searches, and persists a task', async () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:'Tasks'})[0]);
    fireEvent.click(screen.getByRole('button',{name:/new task/i}));
    fireEvent.change(screen.getByPlaceholderText('What needs to get done?'),{target:{value:'Write unit tests'}});
    fireEvent.click(screen.getByRole('button',{name:'Create task'}));
    expect(await screen.findByText('Write unit tests')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search tasks...'),{target:{value:'unit'}});
    fireEvent.change(screen.getByPlaceholderText('Search tasks...'),{target:{value:''}});
    let row=screen.getByText('Write unit tests').closest<HTMLElement>('.taskrow')!;
    fireEvent.click(within(row).getByRole('button',{name:'Complete task'}));
    expect(screen.getByText('Write unit tests').closest('.taskcopy')).toHaveClass('done');
    expect(JSON.parse(localStorage.getItem('daylo_tasks')||'[]').some((task:{title:string;done:boolean})=>task.title==='Write unit tests'&&task.done)).toBe(true);
    row=screen.getByText('Write unit tests').closest<HTMLElement>('.taskrow')!;
    fireEvent.click(within(row).getByRole('button',{name:/options for write unit tests/i}));
    fireEvent.click(within(row).getByRole('menuitem',{name:'Delete task'}));
    expect(screen.queryByText('Write unit tests')).not.toBeInTheDocument();
  });
  it('creates, edits, and removes notes without losing the original entry', async () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:'Notes'})[0]);
    expect(screen.getByText('Save a thought for later')).toBeInTheDocument();
    expect(screen.queryByText('Begin with a small ritual')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/new note/i}));
    fireEvent.change(screen.getByPlaceholderText('Give your note a title'),{target:{value:'First thought'}});
    fireEvent.change(screen.getByPlaceholderText('Add a little more detail…'),{target:{value:'A useful note'}});
    fireEvent.click(screen.getByRole('button',{name:'Save note'}));
    fireEvent.click(await screen.findByText('First thought'));
    fireEvent.change(screen.getByDisplayValue('First thought'),{target:{value:'Edited thought'}});
    fireEvent.click(screen.getByRole('button',{name:'Save changes'}));
    expect(await screen.findByText('Edited thought')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Delete Edited thought'}));
    expect(screen.queryByText('Edited thought')).not.toBeInTheDocument();
  });
  it('creates a goal and logs progress', () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:'Goals'})[0]);
    fireEvent.click(screen.getByRole('button',{name:/new goal/i}));
    fireEvent.change(screen.getByPlaceholderText('What would you like to achieve?'),{target:{value:'Ship the app'}});
    fireEvent.click(screen.getByRole('button',{name:'Create goal'}));
    const card=screen.getByText('Ship the app').closest<HTMLElement>('.goalcard')!;
    expect(card).toBeInTheDocument();fireEvent.click(within(card).getByRole('button',{name:/log progress/i}));
    expect(within(card).getByText('5%')).toBeInTheDocument();
  });
  it('toggles today’s habit and focus timer start, pause, and reset', () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:'Habits'})[0]);
    fireEvent.click(screen.getByRole('button',{name:'New habit'}));
    fireEvent.change(screen.getByPlaceholderText('What habit would you like to build?'),{target:{value:'Move your body'}});
    fireEvent.click(screen.getByRole('button',{name:'Create habit'}));
    fireEvent.click(screen.getByRole('button',{name:'Mark Move your body complete'}));
    expect(JSON.parse(localStorage.getItem('daylo_habits')||'[]')).toContain('Move your body');
    fireEvent.click(screen.getAllByRole('button',{name:'Today'})[0]);
    fireEvent.click(screen.getByRole('button',{name:/focus on this/i}));
    fireEvent.click(screen.getByRole('button',{name:'Start focus'}));
    expect(JSON.parse(localStorage.getItem('daylo_timer')||'{}').start).toBeTypeOf('number');
    fireEvent.click(screen.getByRole('button',{name:'Pause'}));
    expect(JSON.parse(localStorage.getItem('daylo_timer')||'{}').start).toBeNull();
    expect(JSON.parse(localStorage.getItem('daylo_timer')||'{}').remaining).toBeLessThanOrEqual(25*60);
    fireEvent.click(screen.getByRole('button',{name:'Resume focus'}));
    expect(JSON.parse(localStorage.getItem('daylo_timer')||'{}').start).toBeTypeOf('number');
    fireEvent.click(screen.getByRole('button',{name:'Pause'}));
    fireEvent.click(screen.getByRole('button',{name:'Reset'}));
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });
  it('lets focus sessions use a selected duration', () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:/focus on this/i})[0]);
    fireEvent.change(screen.getByRole('combobox',{name:'Focus duration'}),{target:{value:'15'}});
    expect(JSON.parse(localStorage.getItem('daylo_timer')||'{}').minutes).toBe(15);
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });
  it('switches appearance and clears local demo data only after confirmation', () => {
    openWorkspace();
    expect(document.querySelector('.sidebar .brandmark-img')).toHaveAttribute('src','/daylo-logo-dark.png');
    fireEvent.click(screen.getByRole('button',{name:'Toggle appearance'}));
    expect(document.querySelector('main')).toHaveClass('darkmode');
    expect(screen.getAllByRole('img',{name:'Daylo — Make every day count'}).some(logo=>logo.getAttribute('src')==='/daylo-logo-dark.png')).toBe(true);
    localStorage.setItem('daylo_tasks','[]');vi.spyOn(window,'confirm').mockReturnValue(true);
    fireEvent.click(screen.getAllByRole('button',{name:'Settings'})[0]);
    fireEvent.click(screen.getByRole('button',{name:'Clear local data'}));
    expect(localStorage.getItem('daylo_tasks')).toBeNull();
  });
  it('submits assistant messages and shows a graceful network error', async () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));
    fireEvent.change(screen.getByPlaceholderText('Ask Daylo anything…'),{target:{value:'Help me plan'}});
    fireEvent.click(screen.getByRole('button',{name:'Send message'}));
    expect(await screen.findByText('I’m offline right now. You can still use Daylo to organize your tasks, notes, and goals.')).toBeInTheDocument();
  });
  it('sends the selected free model instead of silently routing to another model', async () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    const fetchMock=vi.fn().mockResolvedValue({json:async()=>({reply:'Selected model reply',model:'nvidia/nemotron-3.5-super-vl:free'})});vi.stubGlobal('fetch',fetchMock);
    fireEvent.change(screen.getByRole('combobox',{name:'Free model'}),{target:{value:'nvidia/nemotron-3.5-super-vl:free'}});
    fireEvent.change(screen.getByRole('textbox',{name:'Message Daylo'}),{target:{value:'Help me plan my day'}});
    fireEvent.click(screen.getByRole('button',{name:'Send message'}));
    await waitFor(()=>expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe('nvidia/nemotron-3.5-super-vl:free');
  });
  it('persists the profile name and model preference across section changes', async () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:'Settings'})[0]);
    fireEvent.change(screen.getByRole('textbox',{name:'Your name'}),{target:{value:'Mira'}});
    fireEvent.change(screen.getByRole('combobox',{name:'Free model'}),{target:{value:'nvidia/nemotron-3.5-lightning:free'}});
    expect(JSON.parse(localStorage.getItem('daylo_name')||'""')).toBe('Mira');
    expect(JSON.parse(localStorage.getItem('daylo_model')||'""')).toBe('nvidia/nemotron-3.5-lightning:free');
    fireEvent.click(screen.getAllByRole('button',{name:'Today'})[0]);
    expect(screen.getByRole('heading',{name:/Mira/})).toBeInTheDocument();
  });
it('saves hydration automation enabled state and reminder frequency', () => {
    openWorkspace();fireEvent.click(screen.getAllByRole('button',{name:'Automation'})[0]);
    const hydration=screen.getByRole('checkbox',{name:'Enable hydration reminders'});
    fireEvent.click(hydration);
    expect(JSON.parse(localStorage.getItem('daylo_hydration_enabled')||'false')).toBe(true);
    fireEvent.change(screen.getByRole('combobox',{name:'Hydration reminder frequency'}),{target:{value:'90'}});
    expect(JSON.parse(localStorage.getItem('daylo_hydration_interval')||'0')).toBe(90);
    fireEvent.click(hydration);
    expect(JSON.parse(localStorage.getItem('daylo_hydration_enabled')||'true')).toBe(false);
  });
  it('asks for the user name on first run and uses it in the time-based greeting', async () => {
    localStorage.setItem('daylo_name','""');
    render(<HomePage/>);
    expect(await screen.findByRole('dialog',{name:'A workspace that feels like yours.'})).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox',{name:'Your name'}),{target:{value:'Mira'}});
    fireEvent.click(screen.getByRole('button',{name:'Continue'}));
    expect(screen.getByRole('dialog',{name:'Your day'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Skip tour'}));
    expect(screen.getByRole('heading',{name:/Mira/})).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('daylo_name')||'""')).toBe('Mira');
  });
  it('offers task and goal creation shortcuts inside the assistant', () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    fireEvent.click(screen.getByRole('button',{name:'Add a task'}));
    expect(screen.getByRole('heading',{name:'Add a task'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Close dialog'}));
    fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    fireEvent.click(screen.getByRole('button',{name:'Create a goal'}));
    expect(screen.getByRole('heading',{name:'Create a goal'})).toBeInTheDocument();
  });
  it('runs a scheduled task automation while the workspace is open and persists its run date', async () => {
    const now=new Date();const due=new Date(now.getTime()-60_000);const time=`${String(due.getHours()).padStart(2,'0')}:${String(due.getMinutes()).padStart(2,'0')}`;
    localStorage.setItem('daylo_automations',JSON.stringify([{id:'auto-1',title:'Prepare daily plan',time,cadence:'daily',enabled:true}]));
    openWorkspace();
    expect(await screen.findByText('Prepare daily plan')).toBeInTheDocument();
    const saved=JSON.parse(localStorage.getItem('daylo_automations')||'[]');
    expect(saved[0].lastRun).toBe(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`);
    expect(JSON.parse(localStorage.getItem('daylo_tasks')||'[]')[0].list).toBe('Automated');
  });
  it('creates, switches, and deletes saved assistant conversations', () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    fireEvent.click(screen.getByRole('button',{name:/new chat/i}));
    expect(document.querySelector('.assistant-chat .bubble.ai')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('daylo_chats')||'[]')).toHaveLength(2);
    const remove=screen.getAllByRole('button',{name:/delete chat/i})[0];fireEvent.click(remove);
    expect(JSON.parse(localStorage.getItem('daylo_chats')||'[]')).toHaveLength(1);
  });
  it('opens chat history as a drawer and closes it when a conversation is selected', () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    const panel=document.querySelector('.assistant-fullscreen')!;
    expect(panel).not.toHaveClass('history-open');
    fireEvent.click(screen.getByRole('button',{name:'Show conversations'}));
    expect(panel).toHaveClass('history-open');
    fireEvent.click(screen.getByRole('button',{name:'New conversation'}));
    expect(panel).not.toHaveClass('history-open');
  });
  it('migrates conversations saved by the previous Daylo version', () => {
    localStorage.setItem('daylo_chat',JSON.stringify([{role:'assistant',content:'Saved before the update.'},{role:'user',content:'Plan the week'}]));
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    expect(screen.getByText('Saved before the update.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('daylo_chats')||'[]')[0].title).toBe('Plan the week');
  });
  it('opens and minimizes the floating assistant while preserving its saved thread', () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    expect(screen.getByRole('dialog',{name:'Daylo AI assistant'})).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Minimize assistant'})).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Assistant'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'AI Assistant'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Minimize assistant'}));
    expect(vi.mocked(gsap.to).mock.calls.some(([,config])=>config.duration===.34)).toBe(true);
    expect(screen.getByRole('button',{name:'Open Daylo assistant'})).toBeInTheDocument();
  });
  it('supports the downward swipe gesture to minimize the assistant on touch screens', () => {
    openWorkspace();fireEvent.click(screen.getByRole('button',{name:'Open Daylo assistant'}));
    const header=document.querySelector('.assistant-modal-head')!;
    fireEvent.touchStart(header,{touches:[{identifier:1,target:header,clientX:50,clientY:25}]});
    fireEvent.touchEnd(header,{changedTouches:[{identifier:1,target:header,clientX:55,clientY:150}]});
    expect(screen.getByRole('button',{name:'Open Daylo assistant'})).toBeInTheDocument();
  });
  it('saves individual habit check-ins by date instead of toggling presentation only', () => {
    localStorage.setItem('daylo_habits','[]');openWorkspace();
    fireEvent.click(screen.getByRole('button',{name:'Habits'}));
    fireEvent.click(screen.getByRole('button',{name:'New habit'}));
    fireEvent.change(screen.getByPlaceholderText('What habit would you like to build?'),{target:{value:'Move your body'}});
    fireEvent.click(screen.getByRole('button',{name:'Create habit'}));
    const day = new Intl.DateTimeFormat('en',{weekday:'long'}).format(new Date());
    const checkIn = screen.getByRole('button',{name:`${day} Move your body`});
    fireEvent.click(checkIn);
    const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
    expect(JSON.parse(localStorage.getItem('daylo_habit_log')||'{}')[todayKey]).toContain('Move your body');
    fireEvent.click(checkIn);
    expect(JSON.parse(localStorage.getItem('daylo_habit_log')||'{}')[todayKey]||[]).not.toContain('Move your body');
  });
  it('closes the assistant on Escape and returns keyboard focus to its launcher', async () => {
    openWorkspace();
    const launcher=screen.getByRole('button',{name:'Open Daylo assistant'});
    fireEvent.click(launcher);
    await waitFor(()=>expect(screen.getByRole('textbox',{name:'Message Daylo'})).toHaveFocus());
    fireEvent.keyDown(window,{key:'Escape'});
    const returned=await screen.findByRole('button',{name:'Open Daylo assistant'});
    await waitFor(()=>expect(returned).toHaveFocus());
  });
});
