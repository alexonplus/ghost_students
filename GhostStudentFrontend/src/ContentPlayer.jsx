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

  if (contentType === 'pdf' || contentType === 'text') {
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
    if (!embedId) return;

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player('youtube-player', {
        height: '390',
        width: '640',
        videoId: embedId,
        events: {
          onReady: onReady,
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded?.();
            }
          }
        }
      });
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [embedId, onReady, onEnded]);

  return <div id="youtube-player" style={{ maxWidth: '100%' }} />;
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

function TextViewer({ content }) {
  return (
    <div style={{ padding: '20px', background: '#1e293b', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto', color: '#e2e8f0' }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }}>
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
      width="640"
      height="390"
      controls
      style={{ maxWidth: '100%', background: '#000' }}
      onEnded={onEnded}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
