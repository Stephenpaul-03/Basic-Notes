import React, { useState, useRef ,useEffect} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Alert,
  useWindowDimensions,
  ToastAndroid,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-ico-dazzle-line";
import { StatusBar } from "expo-status-bar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import RenderHtml from 'react-native-render-html';

const Note = () => {
  const { width } = useWindowDimensions();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); 
  const richText = useRef();

  const handleSaveNote = () => {
    if (title.trim() === "") {
      ToastAndroid.show("Title is missing", ToastAndroid.SHORT);
      return;
    }

    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id ? { ...note, title, content } : note
      );
      setNotes(updatedNotes);
      setSelectedNote(null);
    } else {
      const newNote = {
        id: Date.now(),
        title,
        content,
      };
      setNotes([...notes, newNote]);
    }
    setTitle("");
    setContent("");
    setModalVisible(false);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const handleCancelNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setModalVisible(false);
  };

  const handleDeleteNote = (note) => {
    Alert.alert("Confirmation", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          const updatedNotes = notes.filter((item) => item.id !== note.id);
          setNotes(updatedNotes);
          setSelectedNote(null);
          setModalVisible(false);
        },
      },
    ]);
  };

  const handleExportNote = async () => {
    if (selectedNote) {
      const { title, content } = selectedNote;
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
              }
              h1 {
                font-size: 32px;
                text-align: center;
                margin-bottom: 40px;
              }
              p {
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <p>${content}</p>
          </body>
        </html>
      `;
      try {
        const pdf = await Print.printToFileAsync({ html: htmlContent });
        if (pdf) {
          await Sharing.shareAsync(pdf.uri, {
            filename: `${title}.pdf`,
            mimeType: "application/pdf",
          });
          console.log("PDF shared");
        } else {
          console.error("Error creating PDF");
        }
      } catch (error) {
        console.error("Error printing to PDF:", error);
      }
    }
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleEditNote(item)}
      style={styles.noteContainer}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <View style={styles.noteDescription}>
      <RenderHtml
        contentWidth={width}
        source={{ html: item.content }}
        tagsStyles={{
          p: {
            fontSize: 16,
            color: "#555",
            paddingLeft: 10,
          },
          h1: {
            fontSize: 24,
            fontWeight: "bold",
            color: "black",
            paddingLeft: 10,
          },
          strong: {
            fontWeight: 'bold',
          },
          em: {
            fontStyle: 'italic',
          },
          u: {
            textDecorationLine: 'underline',
          },
          ul: {
            marginVertical: 10,
            paddingLeft: 20,
          },
          ol: {
            marginVertical: 10,
            paddingLeft: 20,
          },
          li: {
            fontSize: 16,
            color: "#555",
          },
        }}
      />
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="" />
      <Text style={styles.header}>Notes</Text>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        style={styles.noteList}
      />
      {!isKeyboardVisible && ( 
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setTitle("");
            setContent("");
            setModalVisible(true);
          }}
        >
          <Icon name="plus" height="30" width="30" color="white" />
        </TouchableOpacity>
      )}
      <Modal visible={modalVisible} animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}	style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.editorContainer}>
            <View style={styles.contentInput}>
              <ScrollView style={styles.contentInputScroll}>
                <RichEditor
                  ref={richText}
                  placeholder="Description"
                  initialContentHTML={content}
                  onChange={(text) => setContent(text)}
                />
              </ScrollView>
            </View>
            <RichToolbar
              editor={richText}
              actions={[
                actions.setBold,
                actions.setItalic,
                actions.setUnderline,
                actions.setStrikethrough,
                actions.insertBulletsList,
                actions.insertOrderedList
              ]}
              iconMap={{
                [actions.setBold]: () => <Icon name="bold" size={24} />,
                [actions.setItalic]: () => <Icon name="italic" size={24}/>,
                [actions.setUnderline]: () => <Icon name="underline" size={24}/>,
                [actions.setStrikethrough]: () => <Icon name="strikethrough" size={24}/>,
                [actions.insertBulletsList]: () => <Icon name="list" size={24}/>,
                [actions.insertOrderedList]: () => <Icon name="list-ol" size={24}/>,
              }}
              selectedButtonStyle={styles.selectedButton}
              style={styles.richToolbar}
            />
          </View>

          {!isKeyboardVisible && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancelNote}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              {selectedNote && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleDeleteNote(selectedNote)}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              {selectedNote && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleExportNote(selectedNote)}
                >
                  <Text style={styles.modalButtonText}>Export</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveNote}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 40,
    fontWeight: '300',
    textAlign: "left",
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    color: "#333",
  },
  noteList: {
    flex: 1,
    margin: 10,
  },
  noteContainer: {
    alignSelf: 'center',
    flex: 1,
    marginVertical: 8,
    backgroundColor: "#DCE2EC",
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
    paddingHorizontal: 15,
    width: "100%",
    height: 150,
    margin: 20,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "black",
    marginBottom:10,
  },
  noteDescription:{
    maxHeight:"50%",
    overflow:"hidden"
  },  
  addButton: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    backgroundColor: "grey",
    width: 60,
    height: 60,
    borderRadius: 60,
    position: "absolute",
    bottom: 20,
    right: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF",
    justifyContent: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    paddingLeft: 20,
    fontSize: 18,
    fontWeight:"600",
    marginBottom: 10,
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 0,
    backgroundColor: "#FFF",
    minHeight: "80%",
    marginBottom: 10,
    fontWeight:"400"
  },
  contentInput: {
    padding: 10,
    fontSize: 18,
    minHeight: "75%",
    textAlignVertical: 'top',
    color: "black",
    marginBottom: 10,
  },
  contentInputScroll: {
    flex: 1,
  },
  richToolbar: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 4,
    maxWidth: "80%",
    alignSelf: "center",
    marginBottom:20,
    marginHorizontal:40,
    paddingHorizontal:20,
  },
  selectedButton: {
    backgroundColor: 'lightblue',
    borderRadius: 10,
    borderColor:"#E0E0E0",
    borderWidth:1,
  },
  buttonContainer: {
    flexDirection: "row",
    marginHorizontal: 0,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "grey",
    borderRadius: 5,
    marginRight: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Note;
