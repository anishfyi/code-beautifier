import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'

function App() {
  const [code, setCode] = useState('')
  const [beautifiedCode, setBeautifiedCode] = useState('')
  const [editorInstance, setEditorInstance] = useState(null)
  const [monacoInstance, setMonacoInstance] = useState(null)
  const [language, setLanguage] = useState('html')
  const [theme, setTheme] = useState('dark')
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Initialize theme from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('code-beautifier-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('code-beautifier-theme', theme)
  }, [theme])
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const handleEditorDidMount = (editor, monaco) => {
    setEditorInstance(editor)
    setMonacoInstance(monaco)
    
    // Configure language services
    if (monaco.languages.typescript) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
      })
    }
    
    // Initialize with proper editor settings
    editor.updateOptions({
      tabSize: 2,
      insertSpaces: true,
      autoIndent: 'full',
      formatOnPaste: true
    })
  }

  const handleEditorChange = (value) => {
    setCode(value)
  }

  // Detect language based on code content
  const detectLanguage = (code) => {
    if (!code) return 'javascript'
    
    // Simple language detection based on content patterns
    if (code.includes('<html') || code.includes('<!DOCTYPE') || 
        (code.includes('<') && code.includes('</') && code.includes('>'))) {
      return 'html'
    } else if (code.includes('{') && code.includes('}') && 
              (code.includes('.') || code.includes('#')) && 
              (code.includes(':') && !code.includes('function'))) {
      return 'css'
    } else {
      return 'javascript'
    }
  }
  
  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    
    // Update editor language
    if (editorInstance) {
      monacoInstance.editor.setModelLanguage(editorInstance.getModel(), newLanguage)
    }
  }

  const beautifyCode = async () => {
    if (!code || !monacoInstance) {
      setBeautifiedCode('Please enter some code first.')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Auto-detect language if not explicitly set
      const detectedLanguage = language || detectLanguage(code)
      
      // Configure formatting options based on language
      const formatOptions = {
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        bracketSpacing: true,
        arrowParens: 'always',
      }
      
      let formattedCode = ''
      
      // Format based on language type
      if (detectedLanguage === 'html') {
        try {
          // For HTML, we'll use a simple indentation approach if Prettier fails
          formattedCode = await prettier.format(code, {
            parser: 'html',
            plugins: [parserBabel], // Using babel parser as fallback
            ...formatOptions
          })
        } catch (htmlError) {
          console.warn('HTML formatting error:', htmlError)
          // Fallback to basic formatting
          formattedCode = code.replace(/\>\s*\</g, '>\n<')
                           .replace(/^\s+|\s+$/g, '')
                           .split('\n')
                           .map(line => line.trim())
                           .join('\n')
        }
      } else if (detectedLanguage === 'css') {
        try {
          // For CSS, we'll use a simple indentation approach if Prettier fails
          formattedCode = await prettier.format(code, {
            parser: 'css',
            plugins: [parserBabel], // Using babel parser as fallback
            ...formatOptions
          })
        } catch (cssError) {
          console.warn('CSS formatting error:', cssError)
          // Fallback to basic formatting
          formattedCode = code.replace(/\{\s*/g, ' {\n  ')
                           .replace(/;\s*/g, ';\n  ')
                           .replace(/\s*}/g, '\n}')
                           .replace(/\s*:\s*/g, ': ')
                           .replace(/\s*,\s*/g, ', ')
        }
      } else {
        // JavaScript formatting with babel parser
        formattedCode = await prettier.format(code, {
          parser: 'babel',
          plugins: [parserBabel],
          ...formatOptions
        })
      }
      
      setBeautifiedCode(formattedCode)
    } catch (error) {
      console.error('Error beautifying code:', error)
      setBeautifiedCode(`Error: Failed to beautify code. ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`app-container ${theme}`}>
      <header className="app-header">
        <h1>Code Beautifier</h1>
        <div className="controls">
          <div className="language-selector">
            <label htmlFor="language-select">Select Language: </label>
            <select 
              id="language-select" 
              value={language} 
              onChange={handleLanguageChange}
            >
              <option value="html">HTML</option>
              <option value="javascript">JavaScript</option>
              <option value="css">CSS</option>
            </select>
          </div>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <div className="editor-container">
        <div className="editor-section">
          <div className="editor-header">
            <h2>Input Code</h2>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="450px"
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
          <button 
            onClick={beautifyCode} 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Processing...' : 'Beautify Code'}
          </button>
        </div>
        <div className="editor-section">
          <div className="editor-header">
            <h2>Beautified Code</h2>
            {beautifiedCode && (
              <button 
                className="copy-button" 
                onClick={() => {
                  navigator.clipboard.writeText(beautifiedCode)
                    .then(() => {
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    })
                    .catch(err => console.error('Failed to copy text: ', err));
                }}
                aria-label="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
            )}
          </div>
          <div className="editor-wrapper">
            {isLoading && <div className="loader"></div>}
            {copySuccess && <div className="copy-success visible">Copied!</div>}
            <Editor
              height="450px"
              defaultLanguage={language}
              language={language}
              value={beautifiedCode}
              options={{ 
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
            />
          </div>
        </div>
      </div>
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Code Beautifier</p>
          <a href="https://github.com/anishfyi" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            github.com/anishfyi
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App