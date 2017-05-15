package main

import (
	"fmt"
	"encoding/json"
	"os"
	"strings"
	"strconv"
	"io"
	"net/http"
	"encoding/base64"
	"mime"
	"bytes"
)

type oneEmoji struct {
	Order int `json:"order"`
	Name string `json:"name"`
	Shortname string `json:"shortname"`
	Category string `json:"category"`
	CodePoints struct {
		Output string `json:"output"`
	} `json:"code_points"`
}

type oneCategory struct {
	Order int `json:"order"`
	Category string `json:"category"`
	CategoryLabel string `json:"category_label"`
}

type emoji struct {
	Char string `json:"char"`
	Short string `json:"short"`
	Name string `json:"name"`
	Image string `json:"image"`
}

type emojiGroup struct {
	Name string `json:"name"`
	Emojis []emoji `json:"emojis"`
}

func main() {
	var oneCategorys []oneCategory
	oneCategorysJson, err := os.Open("../emojione/categories.json")
	if err != nil {
		fmt.Println(err)
		return
	}
	dec := json.NewDecoder(oneCategorysJson)
	err = dec.Decode(&oneCategorys)
	if err != nil {
		fmt.Println(err)
	}
	oneCategorysJson.Close()

	var oneEmojis map[string]oneEmoji
	oneEmojisJson, err := os.Open("../emojione/emoji.json")
	if err != nil {
		fmt.Println(err)
		return
	}
	dec = json.NewDecoder(oneEmojisJson)
	err = dec.Decode(&oneEmojis)
	if err != nil {
		fmt.Println(err)
	}
	oneEmojisJson.Close()

	var emojiGroups []emojiGroup
	for i := 1; i <= len(oneCategorys); i++ {
		for _, oc := range oneCategorys {
			if i == oc.Order {
				emojiGroups = append(emojiGroups, emojiGroup{ oc.CategoryLabel, nil })
				break
			}
		}
	}

	num := 0

	for i := 1; i <= len(oneEmojis); i++ {
		l2:
		for _, oe := range oneEmojis {
			if i == oe.Order {
				if
					strings.Index(oe.Shortname, "_tone") != -1 ||
					strings.Index(oe.Shortname, "man_") != -1 ||
					strings.Index(oe.Shortname, "woman_") != -1 ||
					strings.Index(oe.Shortname, "_man") != -1 ||
					strings.Index(oe.Shortname, "_woman") != -1 {
					break l2
				}

				ucStr := strings.TrimLeft(oe.CodePoints.Output, "0")

				var runes []rune
				hexs := strings.Split(ucStr, "-")
				for _, hex := range hexs {
					n, _ := strconv.ParseUint(hex, 16, 64)
					runes = append(runes, rune(n))
				}

				img, err := os.Open("../twemoji/2/72x72/" + ucStr + ".png")
				if err != nil {
					fmt.Println(err)
					continue
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

				for _, oc := range oneCategorys {
					if oc.Category == oe.Category {
						for j := 0; j < len(emojiGroups); j++ {
							if emojiGroups[j].Name == oc.CategoryLabel {
								emojiGroups[j].Emojis = append(emojiGroups[j].Emojis, emoji{ string(runes), oe.Shortname, oe.Name, imgDataUrl.String() })
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
