package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"strconv"
	"strings"
)

type etEmoji struct {
	Order      int    `json:"order"`
	Name       string `json:"name"`
	Shortname  string `json:"shortname"`
	Category   string `json:"category"`
	CodePoints struct {
		FullyQualified string `json:"fully_qualified"`
	} `json:"code_points"`
}

type etCategory struct {
	Order         int    `json:"order"`
	Category      string `json:"category"`
	CategoryLabel string `json:"category_label"`
}

type emoji struct {
	Char  string `json:"char"`
	Short string `json:"short"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

type emojiGroup struct {
	Name   string  `json:"name"`
	Emojis []emoji `json:"emojis"`
}

func main() {
	var etCategorys []etCategory
	etCategorysJson, err := os.Open("../emoji-toolkit/categories.json")
	if err != nil {
		fmt.Println(err)
		return
	}
	dec := json.NewDecoder(etCategorysJson)
	err = dec.Decode(&etCategorys)
	if err != nil {
		fmt.Println(err)
	}
	etCategorysJson.Close()

	var etEmojis map[string]etEmoji
	etEmojisJson, err := os.Open("../emoji-toolkit/emoji.json")
	if err != nil {
		fmt.Println(err)
		return
	}
	dec = json.NewDecoder(etEmojisJson)
	err = dec.Decode(&etEmojis)
	if err != nil {
		fmt.Println(err)
	}
	etEmojisJson.Close()

	var emojiGroups []emojiGroup
	for i := 1; i <= len(etCategorys); i++ {
		for _, oc := range etCategorys {
			if i == oc.Order {
				emojiGroups = append(emojiGroups, emojiGroup{oc.CategoryLabel, nil})
				break
			}
		}
	}

	num := 0

	for i := 1; i <= len(etEmojis); i++ {
	l2:
		for _, ete := range etEmojis {
			if i == ete.Order {
				if strings.Contains(ete.Shortname, "_tone") ||
					strings.Contains(ete.Shortname, "man_") ||
					strings.Contains(ete.Shortname, "woman_") ||
					strings.Contains(ete.Shortname, "_man") ||
					strings.Contains(ete.Shortname, "_woman") {
					break l2
				}

				var runes []rune
				hexs := strings.Split(ete.CodePoints.FullyQualified, "-")
				for _, hex := range hexs {
					chr, _ := strconv.ParseUint(hex, 16, 64)
					runes = append(runes, rune(chr))
				}

				twUcStr := ete.CodePoints.FullyQualified
				img, err := os.Open("../twemoji/assets/72x72/" + twUcStr + ".png")
				if err != nil {
					twUcStr = strings.TrimLeft(twUcStr, "0")
					img, err = os.Open("../twemoji/assets/72x72/" + twUcStr + ".png")
					if err != nil {
						twUcStr = strings.ReplaceAll(twUcStr, "-fe0f", "")
						img, err = os.Open("../twemoji/assets/72x72/" + twUcStr + ".png")
						if err != nil {
							twUcStr = strings.ReplaceAll(twUcStr, "-200d", "")
							img, err = os.Open("../twemoji/assets/72x72/" + twUcStr + ".png")
							if err != nil {
								fmt.Println("cannot find", ete.CodePoints.FullyQualified + ".png")
								continue
							}
						}
					}
				}

				imgDataUrl := bytes.NewBuffer([]byte{})

				imgh := make([]byte, 512)
				img.Read(imgh)

				contType := mime.TypeByExtension(".png")
				if contType == "" {
					contType = http.DetectContentType(imgh)
				}
				fmt.Fprintf(imgDataUrl, "data:%s;base64,", contType)

				enc := base64.NewEncoder(base64.StdEncoding, imgDataUrl)
				enc.Write(imgh)
				io.Copy(enc, img)
				img.Close()
				enc.Close()

				for _, oc := range etCategorys {
					if oc.Category == ete.Category {
						for j := 0; j < len(emojiGroups); j++ {
							if emojiGroups[j].Name == oc.CategoryLabel {
								emojiGroups[j].Emojis = append(emojiGroups[j].Emojis, emoji{string(runes), ete.Shortname, ete.Name, imgDataUrl.String()})
								num++
								break l2
							}
						}
					}
				}
			}
		}
	}

	fmt.Println(num)

	js, _ := os.Create("emoji.js")
	j, _ := json.Marshal(emojiGroups)
	fmt.Fprintf(js, "var emojiGroups = %s;", string(j))
	js.Close()
}
