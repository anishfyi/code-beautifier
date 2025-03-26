import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'

function App() {
  const [code, setCode] = useState('')
  const [editorInstance, setEditorInstance] = useState(null)
  const [monacoInstance, setMonacoInstance] = useState(null)
  const [language, setLanguage] = useState('html')
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

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
      
      setCode(formattedCode)
    } catch (error) {
      console.error('Error beautifying code:', error)
      console.error('Error beautifying code:', error)
      // Show error in editor
      setCode(`Error: Failed to beautify code. ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
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

        </div>
      </header>
      <div className="editor-container">
        <div className="editor-section">
          <div className="editor-header">
            <h2>Code Editor</h2>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="600px"
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
          
            <div className="beautify-button-container">
          <button 
              onClick={beautifyCode} 
              disabled={isLoading}
              className={`beautify-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Beautify Code'}
            </button>
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