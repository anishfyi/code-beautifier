import { useState } from 'react'
import Editor from '@monaco-editor/react'
import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'

function App() {
  const [code, setCode] = useState('')
  const [editorInstance, setEditorInstance] = useState(null)
  const [monacoInstance, setMonacoInstance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

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



  const beautifyCode = async () => {
    if (!code || !monacoInstance) {
      setBeautifiedCode('Please enter some code first.')
      return
    }
    
    setIsLoading(true)
    
    try {
      const formatOptions = {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false
      }
      
      const formattedCode = await prettier.format(code, {
        parser: 'html',
        plugins: [parserHtml],
        ...formatOptions
      })
      
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


        </div>
      </header>
      <div className="editor-container">
        <div className="editor-section">
          <div className="editor-header">
            <h2>Code Editor</h2>
            <span className="editor-info">(currently supports HTML, with more languages coming soon!)</span>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="600px"
              defaultLanguage="html"
              language="html"
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