import { useEffect, useState } from 'react';

export default function ContentPlayer({ content, contentType, onReady, onEnded }) {
  const [error, setError] = useState(null);

  if (contentType === 'youtube') {
    return <YouTubePlayer embedId={content} onReady={onReady} onEnded={onEnded} />;
  }

  if (contentType === 'vimeo') {
    return <VimeoPlayer videoId={content} onReady={onReady} onEnded={onEnded} />;
  }

  if (contentType === 'spotify') {
    return <SpotifyPlayer trackUri={content} />;
  }

  if (contentType === 'pdf') {
    return <PDFViewer src={content} />;
  }

  if (contentType === 'text') {
    return <TextViewer content={content} />;
  }

  if (contentType === 'video') {
    return <VideoPlayer src={content} onReady={onReady} onEnded={onEnded} />;
  }

  return (
    <div style={{ padding: '20px', color: '#ef4444' }}>
      Unsupported content type: {contentType}
    </div>
  );
}

function YouTubePlayer({ embedId, onReady, onEnded }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <iframe
      width="100%"
      height="500px"
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ maxWidth: '100%', borderRadius: '8px' }}
      onLoad={() => onReady?.()}
    />
  );
}

function VimeoPlayer({ videoId, onReady, onEnded }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <iframe
      src={`https://player.vimeo.com/video/${videoId}`}
      width="640"
      height="390"
      frameBorder="0"
      allow="autoplay"
      style={{ maxWidth: '100%' }}
      onEnded={onEnded}
    />
  );
}

function SpotifyPlayer({ trackUri }) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackUri}`}
      width="300"
      height="152"
      frameBorder="0"
      allowFullScreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      style={{ maxWidth: '100%' }}
    />
  );
}

function PDFViewer({ src }) {
  return (
    <object
      data={src}
      type="application/pdf"
      width="100%"
      height="600px"
      style={{ borderRadius: '8px', border: '1px solid #334155', background: '#fff' }}
    >
      <div style={{
        padding: '40px',
        background: '#1e293b',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#e2e8f0'
      }}>
        <p>PDF cannot be displayed in this browser.</p>
        <a href={src} download style={{ color: '#3b82f6', textDecoration: 'underline' }}>Download PDF</a>
      </div>
    </object>
  );
}

function TextViewer({ content }) {
  return (
    <div style={{ padding: '20px', background: '#1e293b', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto', color: '#e2e8f0' }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', fontSize: '0.9rem' }}>
        {content}
      </pre>
    </div>
  );
}

function VideoPlayer({ src, onReady, onEnded }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <video
      width="100%"
      height="500px"
      controls
      style={{ maxWidth: '100%', background: '#000', borderRadius: '8px' }}
      onEnded={onEnded}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
