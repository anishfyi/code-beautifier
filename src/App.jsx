import { useState } from 'react'
import Editor from '@monaco-editor/react'
import prettier from 'prettier'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

function App() {
  const [code, setCode] = useState('')
  const [beautifiedCode, setBeautifiedCode] = useState('')

  const handleEditorChange = (value) => {
    setCode(value)
  }

  const beautifyCode = async () => {
    try {
      const formattedCode = await prettier.format(code, {
        parser: 'babel',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      })
      setBeautifiedCode(formattedCode)
    } catch (error) {
      console.error('Error beautifying code:', error)
    }
  }

  return (
    <div className="app-container">
      <h1>Code Beautifier</h1>
      <div className="editor-container">
        <div className="editor-section">
          <h2>Input Code</h2>
          <Editor
            height="400px"
            defaultLanguage="javascript"
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
          <button onClick={beautifyCode}>Beautify Code</button>
        </div>
        <div className="editor-section">
          <h2>Beautified Code</h2>
          <Editor
            height="400px"
            defaultLanguage="javascript"
            value={beautifiedCode}
            options={{ readOnly: true }}
            theme="vs-dark"
          />
        </div>
      </div>
    </div>
  )
}

export default App