//! Antigravity (`agy`) session discovery.
//! Store layout: `<home>/.gemini/antigravity-cli/brain/<uuid>/.system_generated/logs/transcript.jsonl`

use super::{clean_title, mtime_ms, read_head, SessionEntry};
use serde_json::Value;
use std::path::Path;

fn is_uuid(s: &str) -> bool {
    s.len() == 36
        && s.chars().enumerate().all(|(i, c)| match i {
            8 | 13 | 18 | 23 => c == '-',
            _ => c.is_ascii_hexdigit(),
        })
}

/// Extract first real user message from transcript head.
fn extract_title(head: &str) -> Option<String> {
    for line in head.lines() {
        let Ok(v) = serde_json::from_str::<Value>(line) else {
            continue;
        };
        // Antigravity JSONL: {"type": "USER_INPUT", "content": "..."} or {"source": "USER_EXPLICIT", ...}
        let step_type = v.get("type").and_then(Value::as_str);
        let source = v.get("source").and_then(Value::as_str);
        if step_type == Some("USER_INPUT") || source == Some("USER_EXPLICIT") {
            if let Some(content) = v.get("content").and_then(Value::as_str) {
                if let Some(title) = clean_title(content) {
                    return Some(title);
                }
            }
        }
    }
    None
}

pub fn scan(brain_root: &Path, folder: &str) -> Vec<SessionEntry> {
    let Ok(entries) = std::fs::read_dir(brain_root) else {
        return Vec::new();
    };
    let mut out = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let Some(dirname) = path.file_name().and_then(|n| n.to_str()) else {
            continue;
        };
        if !is_uuid(dirname) {
            continue;
        }
        let transcript = path.join(".system_generated").join("logs").join("transcript.jsonl");
        if !transcript.exists() {
            continue;
        }
        let Some(title) = read_head(&transcript).as_deref().and_then(extract_title) else {
            continue;
        };
        out.push(SessionEntry {
            agent_id: "antigravity".into(),
            session_id: dirname.to_owned(),
            title,
            cwd: folder.to_owned(),
            updated_at_ms: mtime_ms(&transcript),
        });
    }
    out.sort_by_key(|s| std::cmp::Reverse(s.updated_at_ms));
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn scan_finds_antigravity_sessions() {
        let tmp = tempfile::tempdir().unwrap();
        let session_dir = tmp.path().join("6694a00a-facb-4426-a48f-dcbcf99654d3");
        let logs_dir = session_dir.join(".system_generated").join("logs");
        fs::create_dir_all(&logs_dir).unwrap();
        fs::write(
            logs_dir.join("transcript.jsonl"),
            concat!(
                "{\"type\":\"SYSTEM\",\"content\":\"init\"}\n",
                "{\"type\":\"USER_INPUT\",\"content\":\"Hello, assist with coding using Antigravity\"}\n",
            ),
        )
        .unwrap();

        let out = scan(tmp.path(), "/test/repo");
        assert_eq!(out.len(), 1);
        assert_eq!(out[0].agent_id, "antigravity");
        assert_eq!(out[0].session_id, "6694a00a-facb-4426-a48f-dcbcf99654d3");
        assert_eq!(out[0].title, "Hello, assist with coding using Antigravity");
        assert_eq!(out[0].cwd, "/test/repo");
    }
}
