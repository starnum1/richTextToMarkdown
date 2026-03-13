import '@wangeditor/editor/dist/css/style.css';
import './style.css';
import { createEditor, createToolbar } from '@wangeditor/editor';
import TurndownService from 'turndown';
import { marked } from 'marked';

let currentMode = 'toMarkdown';
let editor, toolbar;
let isUpdating = false;

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

function parseMarkdown(markdown) {
    return marked.parse(markdown);
}

const richTextWrapper = document.getElementById('richTextWrapper');
const richTextPreview = document.getElementById('richTextPreview');
const markdownInput = document.getElementById('markdownInput');
const markdownOutput = document.getElementById('markdownOutput');
const leftTitle = document.getElementById('leftTitle');
const rightTitle = document.getElementById('rightTitle');
const copyRightBtn = document.getElementById('copyRightBtn');
const clearLeftBtn = document.getElementById('clearLeftBtn');
const modeBtns = document.querySelectorAll('.mode-btn');

function createRichTextEditor() {
    const editorConfig = {
        placeholder: '在这里输入或粘贴富文本内容...',
        onChange(editor) {
            if (!isUpdating && currentMode === 'toMarkdown') {
                convertToMarkdown();
            }
        }
    };

    editor = createEditor({
        selector: '#editor-container',
        html: '',
        config: editorConfig,
        mode: 'default'
    });

    const toolbarConfig = {
        toolbarKeys: [
            'headerSelect', '|', 'bold', 'italic', 'underline', 'through', 'clearStyle',
            '|', 'bulletedList', 'numberedList', 'todo', '|', 'blockquote', 'code', 'codeBlock',
            '|', 'insertLink', 'insertImage', 'insertTable', '|', 'undo', 'redo'
        ]
    };

    toolbar = createToolbar({
        editor,
        selector: '#editor-toolbar',
        config: toolbarConfig,
        mode: 'default'
    });
}

function convertToMarkdown() {
    const html = editor.getHtml();
    const markdown = turndownService.turndown(html);
    markdownOutput.value = markdown;
}

function convertToRichText() {
    if (isUpdating) return;
    const markdown = markdownInput.value;
    const html = parseMarkdown(markdown);
    document.getElementById('preview-container').innerHTML = html;
}

function switchMode(mode) {
    currentMode = mode;
    isUpdating = true;

    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'toMarkdown') {
        leftTitle.textContent = '富文本编辑器';
        rightTitle.textContent = 'Markdown 输出';

        richTextWrapper.style.display = 'flex';
        markdownInput.style.display = 'none';
        markdownOutput.style.display = 'block';
        richTextPreview.style.display = 'none';

        markdownOutput.readOnly = true;
        copyRightBtn.textContent = '复制';

        if (markdownInput.value) {
            const html = parseMarkdown(markdownInput.value);
            editor.setHtml(html);
        }

        convertToMarkdown();
    } else {
        leftTitle.textContent = 'Markdown 编辑器';
        rightTitle.textContent = '富文本预览';

        richTextWrapper.style.display = 'none';
        markdownInput.style.display = 'block';
        markdownOutput.style.display = 'none';
        richTextPreview.style.display = 'flex';

        copyRightBtn.textContent = '复制 HTML';

        if (editor.getHtml()) {
            const markdown = turndownService.turndown(editor.getHtml());
            markdownInput.value = markdown;
        }

        convertToRichText();
    }

    setTimeout(() => {
        isUpdating = false;
    }, 100);
}

copyRightBtn.addEventListener('click', async () => {
    let content;
    if (currentMode === 'toMarkdown') {
        content = markdownOutput.value;
    } else {
        content = document.getElementById('preview-container').innerHTML;
    }

    try {
        await navigator.clipboard.writeText(content);
        const originalText = copyRightBtn.textContent;
        copyRightBtn.textContent = '✓ 已复制';
        copyRightBtn.style.background = '#28a745';

        setTimeout(() => {
            copyRightBtn.textContent = originalText;
            copyRightBtn.style.background = '#667eea';
        }, 2000);
    } catch (err) {
        alert('复制失败，请手动复制');
    }
});

clearLeftBtn.addEventListener('click', () => {
    if (currentMode === 'toMarkdown') {
        editor.clear();
        markdownOutput.value = '';
    } else {
        markdownInput.value = '';
        document.getElementById('preview-container').innerHTML = '';
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchMode(btn.dataset.mode);
    });
});

markdownInput.addEventListener('input', () => {
    if (!isUpdating && currentMode === 'toRichText') {
        convertToRichText();
    }
});

createRichTextEditor();

const sampleContent = `<h1>欢迎使用双向转换工具</h1>
<p>这是一个<strong>简单</strong>而<em>强大</em>的双向转换工具。</p>
<h2>支持的格式</h2>
<ul>
<li>标题（H1-H6）</li>
<li>粗体和斜体</li>
<li>有序和无序列表</li>
<li>链接和图片</li>
<li>代码块</li>
<li>表格</li>
</ul>
<p>试试切换转换方向吧！</p>`;

editor.setHtml(sampleContent);
convertToMarkdown();
