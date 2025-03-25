import { useState } from 'react'
import Editor from '@monaco-editor/react'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'

function App() {
  const [code, setCode] = useState('')
  const [beautifiedCode, setBeautifiedCode] = useState('')
  const [editorInstance, setEditorInstance] = useState(null)
  const [monacoInstance, setMonacoInstance] = useState(null)
  const [language, setLanguage] = useState('javascript')

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
    }
  }

  return (
    <div className="app-container">
      <h1>Code Beautifier</h1>
      <div className="language-selector">
        <label htmlFor="language-select">Select Language: </label>
        <select 
          id="language-select" 
          value={language} 
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>
      <div className="editor-container">
        <div className="editor-section">
          <h2>Input Code</h2>
          <Editor
            height="400px"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            }}
          />
          <button onClick={beautifyCode}>Beautify Code</button>
        </div>
        <div className="editor-section">
          <h2>Beautified Code</h2>
          <Editor
            height="400px"
            defaultLanguage={language}
            language={language}
            value={beautifiedCode}
            options={{ 
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on'
            }}
            theme="vs-dark"
          />
        </div>
      </div>
    </div>
  )
}

export default App