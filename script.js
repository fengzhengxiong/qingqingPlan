// script.js

const TEMPLATES_STORAGE_KEY = 'taskTimelineTemplates';
let taskCounter = 0;

// *** 基准日期配置 (非常重要!) ***
const REFERENCE_DATE_CONFIG = {
    date: new Date('2025-05-26T00:00:00'), 
    statusIndex: 0 // 2025年5月26日是上班第一天 (索引为0)
};
const CYCLE_LENGTH = 6; // 4天上班 + 2天休息

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const finalEventDateInput = document.getElementById('finalEventDate');
    if (finalEventDateInput) {
        finalEventDateInput.value = `${yyyy}-${mm}-${dd}`; 
        finalEventDateInput.addEventListener('change', updateDateStatus);
        updateDateStatus(); 
    }

    const calculateTimelineButton = document.getElementById('calculateTimelineButton');
    if (calculateTimelineButton) {
        calculateTimelineButton.addEventListener('click', calculateTimeline);
    }

    const addTaskButton = document.getElementById('addTaskButton');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', addSequentialTask);
    }

    taskCounter = document.querySelectorAll('#taskChainContainer .task-item').length;
    updateTaskTitles(); 

    const saveTemplateButton = document.getElementById('saveTemplateButton');
    if (saveTemplateButton) {
        saveTemplateButton.addEventListener('click', saveCurrentTemplate);
    }

    const loadTemplateButton = document.getElementById('loadTemplateButton');
    if (loadTemplateButton) {
        loadTemplateButton.addEventListener('click', loadSelectedTemplate);
    }

    const deleteTemplateButton = document.getElementById('deleteTemplateButton');
    if (deleteTemplateButton) {
        deleteTemplateButton.addEventListener('click', deleteSelectedTemplate);
    }

    loadTemplatesIntoSelector();
});


function updateDateStatus() {
    const finalEventDateInput = document.getElementById('finalEventDate');
    const dateStatusIndicator = document.getElementById('dateStatusIndicator');

    if (!finalEventDateInput || !dateStatusIndicator) return;

    const selectedDateString = finalEventDateInput.value;
    if (!selectedDateString) {
        dateStatusIndicator.innerHTML = ''; 
        dateStatusIndicator.className = 'date-status';
        return;
    }

    const parts = selectedDateString.split('-');
    const selectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);

    const refDate = new Date(REFERENCE_DATE_CONFIG.date.getFullYear(), REFERENCE_DATE_CONFIG.date.getMonth(), REFERENCE_DATE_CONFIG.date.getDate(), 12, 0, 0);

    const timeDiff = selectedDate.getTime() - refDate.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

    let currentStatusIndex = (dayDiff + REFERENCE_DATE_CONFIG.statusIndex) % CYCLE_LENGTH;
    if (currentStatusIndex < 0) {
        currentStatusIndex += CYCLE_LENGTH;
    }

    let statusText = '';
    let warmMessage = '';
    let statusClass = 'date-status';

    if (currentStatusIndex >= 0 && currentStatusIndex <= 2) { 
        statusText = `☀️ 上班第 ${currentStatusIndex + 1} 天`;
        warmMessage = "温馨提醒：记得要好好吃饭，好好睡觉，要开心，要快乐，更要好好爱自己！❤️";
        statusClass += ' work-day';
    } else if (currentStatusIndex === 3) { 
        statusText = `🎉 上班第 ${currentStatusIndex + 1} 天 (马上解放啦!)`;
        warmMessage = "温馨提醒：记得要好好吃饭，好好睡觉，要开心，要快乐，去见想见的人吧！🥳";
        statusClass += ' work-day';
    } else if (currentStatusIndex >= 4 && currentStatusIndex <= 5) { 
        statusText = `🌙 休息第 ${currentStatusIndex - 4 + 1} 天`;
        warmMessage = "温馨提醒：尽情享受属于自己的悠闲时光吧！😴"; 
        statusClass += ' rest-day';
    }

    if (warmMessage) {
        dateStatusIndicator.innerHTML = `${statusText}<br><span class="warm-message">${warmMessage}</span>`;
    } else {
        dateStatusIndicator.textContent = statusText;
    }
    dateStatusIndicator.className = statusClass;
}


function addSequentialTask() {
    const taskContainer = document.getElementById('taskChainContainer');
    if (!taskContainer) return;

    const currentTaskIndexInDOM = taskContainer.children.length;
    const uniqueIdPart = taskCounter;

    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-item');

    taskDiv.innerHTML = `
        <div class="task-header">
            <span class="task-title">步骤 ${currentTaskIndexInDOM + 1}</span>
            <div class="task-controls">
                <button type="button" class="control-button move-task-up" title="上移" onclick="moveTask(this, 'up')">▲</button>
                <button type="button" class="control-button move-task-down" title="下移" onclick="moveTask(this, 'down')">▼</button>
                <button type="button" class="control-button delete-task-button" title="删除" onclick="removeTask(this)">×</button>
            </div>
        </div>
        <label for="taskName_${uniqueIdPart}">任务名称:</label>
        <input type="text" id="taskName_${uniqueIdPart}" class="task-name" placeholder="写下你的小计划吧~">
        <label for="taskDuration_${uniqueIdPart}">预计耗时 (分钟):</label>
        <input type="number" id="taskDuration_${uniqueIdPart}" class="task-duration" value="15" min="1" required>
    `;

    taskContainer.appendChild(taskDiv);
    taskCounter++;
    updateTaskTitles();
}

function removeTask(buttonElement) {
    const taskItem = buttonElement.closest('.task-item');
    if (taskItem) {
        taskItem.remove();
        updateTaskTitles();
    }
}

function moveTask(buttonElement, direction) {
    const taskItem = buttonElement.closest('.task-item');
    const container = taskItem.parentElement;
    if (!container) return;

    if (direction === 'up' && taskItem.previousElementSibling) {
        container.insertBefore(taskItem, taskItem.previousElementSibling);
    } else if (direction === 'down' && taskItem.nextElementSibling) {
        container.insertBefore(taskItem.nextElementSibling, taskItem);
    }
    updateTaskTitles();
}

function updateTaskTitles() {
    const taskItems = document.querySelectorAll('#taskChainContainer .task-item');
    taskItems.forEach((item, index) => {
        const titleElement = item.querySelector('.task-title');
        if (titleElement) {
            titleElement.textContent = `步骤 ${index + 1}`;
        }
        const upButton = item.querySelector('.move-task-up');
        const downButton = item.querySelector('.move-task-down');
        if (upButton) upButton.disabled = (index === 0);
        if (downButton) downButton.disabled = (index === taskItems.length - 1);
    });
}

function getSavedTemplates() {
    const templatesJson = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    try {
        return templatesJson ? JSON.parse(templatesJson) : {};
    } catch (e) {
        console.error("Error parsing templates from localStorage:", e);
        showError("哎呀，读取常用流程时好像出错了 >_<");
        return {};
    }
}

function saveTemplates(templates) {
    try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
        console.error("Error saving templates to localStorage:", e);
        showError("呜，保存常用流程失败了，可能是空间不足哦~");
    }
}

function loadTemplatesIntoSelector() {
    const templates = getSavedTemplates();
    const selector = document.getElementById('templateSelector');
    if (!selector) return;

    while (selector.options.length > 1) {
        selector.remove(1);
    }

    let hasTemplates = false;
    for (const templateName in templates) {
        if (templates.hasOwnProperty(templateName)) {
            const option = document.createElement('option');
            option.value = templateName;
            option.textContent = templateName;
            selector.appendChild(option);
            hasTemplates = true;
        }
    }
    document.getElementById('loadTemplateButton').disabled = !hasTemplates;
    document.getElementById('deleteTemplateButton').disabled = !hasTemplates;
    if (!hasTemplates && selector.options.length === 1) {
         selector.options[0].textContent = "-- 还没有常用流程哦 --";
    } else if (selector.options.length > 1) {
         selector.options[0].textContent = "-- 选择常用流程 --";
    }
}

function saveCurrentTemplate() {
    hideError();
    const templateNameInput = document.getElementById('templateNameInput');
    const templateName = templateNameInput.value.trim();

    if (!templateName) {
        showError("要给这个流程起一个可爱的名字哦~");
        templateNameInput.focus();
        return;
    }

    const tasksData = [];
    const taskElements = document.querySelectorAll('#taskChainContainer .task-item');
    if (taskElements.length === 0) {
        showError("还没有添加任何准备步骤呢~");
        return;
    }

    let allTasksValid = true;
    taskElements.forEach(taskElement => {
        const nameInput = taskElement.querySelector('.task-name');
        const durationInput = taskElement.querySelector('.task-duration');
        const name = nameInput.value.trim();
        const duration = parseInt(durationInput.value);

        nameInput.style.border = "";
        durationInput.style.border = "";

        if (name && !isNaN(duration) && duration > 0) {
            tasksData.push({ name, duration });
        } else {
            allTasksValid = false;
            if (!name) nameInput.style.border = "1px solid red";
            if (isNaN(duration) || duration <= 0) durationInput.style.border = "1px solid red";
        }
    });

    if (!allTasksValid) {
        showError("有些步骤信息好像不太对哦，检查一下红色框框吧！");
        return;
    }
    
    const arriveEarlyMinsInput = document.getElementById('arriveEarlyMinutes');
    const arriveEarlyMins = parseInt(arriveEarlyMinsInput.value);
    arriveEarlyMinsInput.style.border = "";
    if (isNaN(arriveEarlyMins) || arriveEarlyMins < 0) {
        showError("“提前完成分钟数”好像不太对呢~");
        arriveEarlyMinsInput.style.border = "1px solid red";
        return;
    }

    const templateData = {
        tasks: tasksData,
        arriveEarlyMinutes: arriveEarlyMins
    };

    const templates = getSavedTemplates();
    if (templates[templateName] && !confirm(`“${templateName}”这个流程已经有了，要覆盖它吗？`)) {
        return;
    }
    templates[templateName] = templateData;
    saveTemplates(templates);

    loadTemplatesIntoSelector();
    document.getElementById('templateSelector').value = templateName;
    templateNameInput.value = '';
    alert(`太棒啦！“${templateName}”流程已保存成功~ 🎉`);
}

function loadSelectedTemplate() {
    hideError();
    const selector = document.getElementById('templateSelector');
    const templateName = selector.value;

    if (!templateName) {
        showError("要先选择一个常用流程哦~");
        return;
    }

    const templates = getSavedTemplates();
    const templateData = templates[templateName];

    if (!templateData) {
        showError(`呜，没有找到“${templateName}”这个流程 >_<`);
        return;
    }

    const taskContainer = document.getElementById('taskChainContainer');
    taskContainer.innerHTML = ''; 

    if (templateData.tasks && Array.isArray(templateData.tasks)) {
        templateData.tasks.forEach(taskInfo => {
            addSequentialTask(); 
            const newTaskItem = taskContainer.lastElementChild;
            if (newTaskItem) {
                const nameInput = newTaskItem.querySelector('.task-name');
                const durationInput = newTaskItem.querySelector('.task-duration');
                if (nameInput) nameInput.value = taskInfo.name;
                if (durationInput) durationInput.value = taskInfo.duration;
            }
        });
    }

    const arriveEarlyMinsInput = document.getElementById('arriveEarlyMinutes');
    if (arriveEarlyMinsInput && typeof templateData.arriveEarlyMinutes === 'number') {
        arriveEarlyMinsInput.value = templateData.arriveEarlyMinutes;
    }

    alert(`“${templateName}”流程已为你准备好啦~ ✨`);
    document.getElementById('result').style.display = 'none';
    updateDateStatus(); 
}

function deleteSelectedTemplate() {
    hideError();
    const selector = document.getElementById('templateSelector');
    const templateName = selector.value;

    if (!templateName) {
        showError("要先选择一个想删除的流程哦~");
        return;
    }

    if (!confirm(`真的要删除“${templateName}”这个流程吗？删了就没啦！`)) {
        return;
    }

    const templates = getSavedTemplates();
    if (templates[templateName]) {
        delete templates[templateName];
        saveTemplates(templates);
        loadTemplatesIntoSelector(); 
        alert(`“${templateName}”流程已删除~`);
    } else {
        showError(`咦，“${templateName}”好像已经被删除了哦~`);
    }
}

function calculateTimeline() {
    hideError();
    updateDateStatus(); 
    const finalEventDesc = document.getElementById('finalEventDescription').value || "某个重要时刻";
    const finalEventDateStr = document.getElementById('finalEventDate').value;
    const finalEventTimeStr = document.getElementById('finalEventTime').value;
    const arriveEarlyMins = parseInt(document.getElementById('arriveEarlyMinutes').value);

    const resultDiv = document.getElementById('result');
    const targetDeadlineInfoDiv = document.getElementById('targetDeadlineInfo');
    const timelineDisplayDiv = document.getElementById('timelineDisplay');
    const firstTaskStartTimeInfoP = document.getElementById('firstTaskStartTimeInfo');
    const totalDurationInfoP = document.getElementById('totalDurationInfo');

    resultDiv.style.display = 'none';
    targetDeadlineInfoDiv.innerHTML = '';
    timelineDisplayDiv.innerHTML = '';
    firstTaskStartTimeInfoP.innerHTML = '';
    totalDurationInfoP.innerHTML = '';


    if (!finalEventDateStr || !finalEventTimeStr) {
        showError("要先选好目标日期和时间哦~");
        return;
    }
    if (isNaN(arriveEarlyMins) || arriveEarlyMins < 0) {
        showError("提前准备的时间好像不太对呢~ (请输入0或更大的数字)");
        return;
    }

    const finalEventDateTimeStr = `${finalEventDateStr}T${finalEventTimeStr}:00`;
    const finalEventDateTime = new Date(finalEventDateTimeStr);

    if (isNaN(finalEventDateTime.getTime())) {
        showError("目标日期或时间格式好像有点问题哦~");
        return;
    }

    const taskChainDeadline = new Date(finalEventDateTime.getTime() - arriveEarlyMins * 60000);

    const tasks = [];
    const taskElements = document.querySelectorAll('#taskChainContainer .task-item');
    let totalCalculatedDuration = 0;

    if (taskElements.length === 0) {
        showError("还没有添加任何准备步骤哦~");
        return;
    }

    let allTasksValidForCalc = true;
    taskElements.forEach(taskElement => {
        const nameInput = taskElement.querySelector('.task-name');
        const durationInput = taskElement.querySelector('.task-duration');
        const taskName = nameInput.value.trim() || `一个神秘步骤`;
        const taskDurationMins = parseInt(durationInput.value);

        durationInput.style.border = "";
        if (isNaN(taskDurationMins) || taskDurationMins < 1) {
            durationInput.style.border = "1px solid red";
            allTasksValidForCalc = false;
        } else {
            tasks.push({
                name: taskName,
                duration: taskDurationMins,
            });
            totalCalculatedDuration += taskDurationMins;
        }
    });
    
    if (!allTasksValidForCalc) {
        showError("有些步骤的“预计耗时”好像不对哦，检查一下红色框框吧！");
        return;
    }

    let currentEndTime = new Date(taskChainDeadline.getTime());
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        task.endTime = new Date(currentEndTime.getTime());
        task.startTime = new Date(currentEndTime.getTime() - task.duration * 60000);
        currentEndTime = new Date(task.startTime.getTime());
    }

    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };

    const formattedFinalEvent = `${finalEventDateTime.toLocaleDateString('zh-CN', optionsDate)} ${finalEventDateTime.toLocaleTimeString('zh-CN', optionsTime)}`;
    const formattedTaskDeadline = `${taskChainDeadline.toLocaleDateString('zh-CN', optionsDate)} ${taskChainDeadline.toLocaleTimeString('zh-CN', optionsTime)}`;

    targetDeadlineInfoDiv.innerHTML = `
        <p><strong>最终目标 (${finalEventDesc})：</strong> ${formattedFinalEvent}</p>
        <p><strong>所有准备需在：</strong> <span class="highlight">${formattedTaskDeadline}</span> 前完成哦~</p>
    `;
    
    const timelineTitleEl = document.createElement('h3'); 
    timelineDisplayDiv.appendChild(timelineTitleEl);
    timelineTitleEl.textContent = "您的时间表:"; // 简化标题

    tasks.forEach((task, index) => {
        const formattedStartTime = task.startTime.toLocaleTimeString('zh-CN', optionsTime);
        const formattedEndTime = task.endTime.toLocaleTimeString('zh-CN', optionsTime);
        
        let timeRangeStr = `${formattedStartTime} - ${formattedEndTime}`;
        let displayDatePrefix = "";

        const shortDateOptions = { month: 'short', day: 'numeric' };

        if (task.startTime.toDateString() !== task.endTime.toDateString()) { 
            displayDatePrefix = `${task.startTime.toLocaleDateString('zh-CN', shortDateOptions)} `;
            let displayEndDatePrefix = `${task.endTime.toLocaleDateString('zh-CN', shortDateOptions)} `;
            timeRangeStr = `${displayDatePrefix}${formattedStartTime} — ${displayEndDatePrefix}${formattedEndTime}`;
        } else if (task.startTime.toDateString() !== taskChainDeadline.toDateString()) { 
             displayDatePrefix = `${task.startTime.toLocaleDateString('zh-CN', shortDateOptions)} `;
             timeRangeStr = `${displayDatePrefix}${formattedStartTime} — ${formattedEndTime}`;
        }

        const entryDiv = document.createElement('div');
        entryDiv.classList.add('timeline-entry');
        entryDiv.innerHTML = `
            <span class="time-range">${index + 1}. ${timeRangeStr}</span>
            <span class="task-name-display">【${task.name}】</span>
            <span class="duration-display">(耗时: ${task.duration}分钟)</span>
        `;
        timelineDisplayDiv.appendChild(entryDiv);
    });

    if (tasks.length > 0) {
        const firstTask = tasks[0];
        const formattedFirstTaskStartDate = firstTask.startTime.toLocaleDateString('zh-CN', optionsDate);
        const formattedFirstTaskStartTime = firstTask.startTime.toLocaleTimeString('zh-CN', optionsTime);
        firstTaskStartTimeInfoP.innerHTML = `您需要在 <span class="highlight">${formattedFirstTaskStartDate} ${formattedFirstTaskStartTime}</span> 开始第一个步骤哦！`;
    }
    totalDurationInfoP.innerHTML = `所有步骤总计耗时：<span class="highlight">${totalCalculatedDuration} 分钟</span>。`;

    resultDiv.style.display = 'block';
    if (window.innerWidth < 768) {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showError(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    errorMessageDiv.textContent = `😟 Oops! ${message}`;
    errorMessageDiv.style.display = 'block';
}

function hideError() {
    const errorMessageDiv = document.getElementById('errorMessage');
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';
}