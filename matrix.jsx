import React, { useState, useRef, useEffect } from 'react';

// Bracket component that scales with content
function Bracket({ type, side, height }) {
  const width = 12;
  const strokeWidth = 2;
  
  const renderBracket = () => {
    switch (type) {
      case 'bmatrix':
        return side === 'left' ? (
          <path
            d={`M ${width} 0 L ${strokeWidth} 0 L ${strokeWidth} ${height} L ${width} ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
          />
        ) : (
          <path
            d={`M 0 0 L ${width - strokeWidth} 0 L ${width - strokeWidth} ${height} L 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="square"
          />
        );
      
      case 'pmatrix':
        return side === 'left' ? (
          <path
            d={`M ${width} 0 Q ${strokeWidth} ${height / 2} ${width} ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ) : (
          <path
            d={`M 0 0 Q ${width - strokeWidth} ${height / 2} 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      
      case 'vmatrix':
        return (
          <line
            x1={side === 'left' ? width - strokeWidth : strokeWidth}
            y1={0}
            x2={side === 'left' ? width - strokeWidth : strokeWidth}
            y2={height}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        );
      
      case 'Bmatrix':
        const midY = height / 2;
        return side === 'left' ? (
          <path
            d={`M ${width} 0 Q ${strokeWidth} ${midY / 2} ${width / 2} ${midY} Q ${strokeWidth} ${midY + midY / 2} ${width} ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ) : (
          <path
            d={`M 0 0 Q ${width - strokeWidth} ${midY / 2} ${width / 2} ${midY} Q ${width - strokeWidth} ${midY + midY / 2} 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      
      case 'Vmatrix':
        return (
          <>
            <line
              x1={side === 'left' ? width - strokeWidth - 3 : strokeWidth}
              y1={0}
              x2={side === 'left' ? width - strokeWidth - 3 : strokeWidth}
              y2={height}
              stroke="currentColor"
              strokeWidth={strokeWidth}
            />
            <line
              x1={side === 'left' ? width - strokeWidth + 2 : strokeWidth + 5}
              y1={0}
              x2={side === 'left' ? width - strokeWidth + 2 : strokeWidth + 5}
              y2={height}
              stroke="currentColor"
              strokeWidth={strokeWidth}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  if (type === 'matrix') return null;

  return (
    <svg
      width={width}
      height={height}
      style={{ minWidth: width, color: '#111' }}
    >
      {renderBracket()}
    </svg>
  );
}

function MatrixPreview({ values, rows, cols, matrixType }) {
  const matrixRef = useRef(null);
  const [matrixHeight, setMatrixHeight] = useState(100);

  useEffect(() => {
    if (matrixRef.current) {
      setMatrixHeight(matrixRef.current.offsetHeight);
    }
  }, [values, rows, cols]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'stretch', gap: '8px' }}>
      <Bracket type={matrixType} side="left" height={matrixHeight} />
      
      <div 
        ref={matrixRef}
        style={{ 
          display: 'grid',
          gap: '8px',
          padding: '8px 0',
          gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`
        }}
      >
        {values.map((row, i) =>
          row.map((cell, j) => (
            <div 
              key={`${i}-${j}`}
              style={{
                textAlign: 'center',
                color: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cell || '0'}
            </div>
          ))
        )}
      </div>

      <Bracket type={matrixType} side="right" height={matrixHeight} />
    </div>
  );
}

export default function MatrixLatexGenerator() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrixType, setMatrixType] = useState('bmatrix');
  const [values, setValues] = useState(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [copied, setCopied] = useState(false);

  const updateMatrixSize = (newRows, newCols) => {
    const newValues = Array(newRows).fill(null).map((_, i) => 
      Array(newCols).fill(null).map((_, j) => 
        (i < rows && j < cols) ? values[i][j] : ''
      )
    );
    setRows(newRows);
    setCols(newCols);
    setValues(newValues);
  };

  const handleCellChange = (i, j, value) => {
    const newValues = values.map(row => [...row]);
    newValues[i][j] = value;
    setValues(newValues);
  };

  const generateLatex = () => {
    const matrixContent = values
      .map(row => row.map(cell => cell || '0').join(' & '))
      .join(' \\\\\n  ');
    return `\\begin{${matrixType}}\n  ${matrixContent}\n\\end{${matrixType}}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateLatex());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const matrixTypes = [
    { value: 'bmatrix', label: '[ ] Brackets' },
    { value: 'pmatrix', label: '( ) Parentheses' },
    { value: 'vmatrix', label: '| | Determinant' },
    { value: 'Bmatrix', label: '{ } Braces' },
    { value: 'Vmatrix', label: '|| || Double bars' },
    { value: 'matrix', label: 'No brackets' },
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8f7f2',
      backgroundImage: `
        linear-gradient(rgba(70, 130, 180, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(70, 130, 180, 0.08) 1px, transparent 1px),
        linear-gradient(rgba(70, 130, 180, 0.08) 0.5px, transparent 0.5px),
        linear-gradient(90deg, rgba(70, 130, 180, 0.08) 0.5px, transparent 0.5px)
      `,
      backgroundSize: '20px 20px, 20px 20px, 5px 5px, 5px 5px',
      padding: '48px 24px',
      fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    wrapper: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#111',
      marginBottom: '12px',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#555',
      lineHeight: 1.7,
    },
    gridContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    section: {
      background: '#fff',
      padding: '32px',
      borderRadius: '2px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid rgba(70, 130, 180, 0.1)',
      transition: 'all 0.3s ease',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#c43544',
      marginBottom: '24px',
      letterSpacing: '-0.01em',
    },
    controlGroup: {
      marginBottom: '0',
    },
    controlLabel: {
      display: 'block',
      fontSize: '0.95rem',
      fontWeight: 500,
      color: '#111',
      marginBottom: '12px',
    },
    slider: {
      width: '100%',
      height: '4px',
      background: 'rgba(70, 130, 180, 0.2)',
      borderRadius: '2px',
      outline: 'none',
      cursor: 'pointer',
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    button: {
      padding: '12px',
      fontSize: '0.9rem',
      fontWeight: 500,
      border: '1px solid rgba(70, 130, 180, 0.2)',
      borderRadius: '2px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: '#fff',
      color: '#111',
    },
    buttonActive: {
      background: '#c43544',
      color: '#fff',
      border: '1px solid #c43544',
    },
    matrixGrid: {
      display: 'inline-grid',
      gap: '8px',
    },
    input: {
      width: '100%',
      padding: '10px',
      textAlign: 'center',
      border: '1px solid rgba(70, 130, 180, 0.2)',
      borderRadius: '2px',
      fontSize: '1rem',
      fontFamily: "'Montserrat', sans-serif",
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    codeSection: {
      background: '#111',
      borderRadius: '2px',
      padding: '24px',
      marginBottom: '24px',
    },
    codeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    codeTitle: {
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    copyButton: {
      padding: '10px 20px',
      background: '#c43544',
      color: '#fff',
      border: 'none',
      borderRadius: '2px',
      fontSize: '0.9rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    codeBlock: {
      background: '#1a1a1a',
      borderRadius: '2px',
      padding: '16px',
      overflowX: 'auto',
      maxHeight: '200px',
    },
    code: {
      color: '#4ec9b0',
      fontFamily: "'Courier New', monospace",
      fontSize: '0.9rem',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    },
    previewBox: {
      background: '#fff',
      border: '1px solid rgba(70, 130, 180, 0.1)',
      borderRadius: '2px',
      padding: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '150px',
    },
    tip: {
      background: 'rgba(70, 130, 180, 0.08)',
      padding: '16px',
      borderRadius: '2px',
      fontSize: '0.85rem',
      color: '#555',
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>LaTeX Matrix Editor</h1>
          <p style={styles.subtitle}>
            For those too lazy to format them in LaTeX. Made with Claude.
          </p>
        </div>

        <div style={styles.gridContainer}>
          {/* Matrix Size Controls */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Matrix Size</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Rows: {rows}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => updateMatrixSize(parseInt(e.target.value), cols)}
                  style={styles.slider}
                />
              </div>
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Columns: {cols}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => updateMatrixSize(rows, parseInt(e.target.value))}
                  style={styles.slider}
                />
              </div>
            </div>
          </div>

          {/* Matrix Type Selection */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Matrix Type</h2>
            <div style={styles.buttonGrid}>
              {matrixTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setMatrixType(type.value)}
                  style={{
                    ...styles.button,
                    ...(matrixType === type.value ? styles.buttonActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (matrixType !== type.value) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.07)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Value Editor */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Edit Values</h2>
            <div style={{ overflowX: 'auto' }}>
              <div 
                style={{ 
                  ...styles.matrixGrid,
                  gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))` 
                }}
              >
                {values.map((row, i) =>
                  row.map((cell, j) => (
                    <input
                      key={`${i}-${j}`}
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(i, j, e.target.value)}
                      style={styles.input}
                      placeholder="0"
                      onFocus={(e) => e.target.style.borderColor = '#c43544'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(70, 130, 180, 0.2)'}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* LaTeX Code Output */}
          <div style={styles.section}>
            <div style={styles.codeSection}>
              <div style={styles.codeHeader}>
                <h3 style={styles.codeTitle}>LaTeX Code</h3>
                <button
                  onClick={copyToClipboard}
                  style={styles.copyButton}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#a82d3a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#c43544';
                  }}
                >
                  <span>{copied ? '✓' : '📋'}</span>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div style={styles.codeBlock}>
                <pre style={styles.code}>{generateLatex()}</pre>
              </div>
            </div>

            <h3 style={{...styles.sectionTitle, marginBottom: '16px'}}>Visual Preview</h3>
            <div style={styles.previewBox}>
              <MatrixPreview 
                values={values} 
                rows={rows} 
                cols={cols} 
                matrixType={matrixType} 
              />
            </div>

            <div style={{...styles.tip, marginTop: '24px'}}>
              <strong>Note:</strong> Include <code style={{background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '2px'}}>
                \usepackage{'{'}amsmath{'}'}
              </code> in your LaTeX document preamble.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
