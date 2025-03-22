package cache

import (
	"os"
	"path/filepath"
	"time"
)

type FileCacheConfig struct {
	RootDir               string
	MetadataCheckInterval time.Duration
	ValidityInterval      time.Duration
}

type Cache interface {
	Get(key string) ([]byte, error)
}

type fileCacheEntry struct {
	Content          []byte
	LoadedAt         time.Time
	ModTimeCheckedAt time.Time
	LastModTime      time.Time
}

type fileCache struct {
	Config FileCacheConfig
	Cache  map[string]*fileCacheEntry
}

func NewFileCache(config ...FileCacheConfig) Cache {
	var c FileCacheConfig
	if len(config) == 0 {
		c = FileCacheConfig{
			MetadataCheckInterval: time.Minute * 5,
			ValidityInterval:      time.Hour * 1,
		}
	} else {
		c = config[0]
	}
	return &fileCache{
		Config: c,
		Cache:  map[string]*fileCacheEntry{},
	}
}

func (c *fileCache) Get(key string) ([]byte, error) {
	path := filepath.Join(c.Config.RootDir, key)
	entry, exists := c.Cache[key]
	now := time.Now().UTC()
	if !exists || entry.LoadedAt.Add(c.Config.ValidityInterval).Before(now) {
		file, err := os.Open(path)
		if err != nil {
			return nil, err
		}
		fileMetadata, err := file.Stat()
		if err != nil {
			return nil, err
		}
		modTime := fileMetadata.ModTime().UTC()
		content, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		entry = &fileCacheEntry{
			Content:          content,
			LoadedAt:         now,
			ModTimeCheckedAt: now,
			LastModTime:      modTime,
		}
		c.Cache[key] = entry
	} else if entry.ModTimeCheckedAt.Add(c.Config.MetadataCheckInterval).Before(now) {
		file, err := os.Open(path)
		if err != nil {
			return nil, err
		}
		fileMetadata, err := file.Stat()
		if err != nil {
			return nil, err
		}
		modTime := fileMetadata.ModTime().UTC()
		if modTime.After(entry.LastModTime) {
			content, err := os.ReadFile(path)
			if err != nil {
				return nil, err
			}
			entry = &fileCacheEntry{
				Content:          content,
				LoadedAt:         now,
				ModTimeCheckedAt: now,
				LastModTime:      modTime,
			}
			c.Cache[key] = entry
		}
	}
	return entry.Content, nil
}
