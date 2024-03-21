// This is an auto-generated file, do not edit manually

export const definition = {
  "models": {
    "Composite": {
      "id": "kjzl6hvfrbw6c9kigzo7cylhkiageuvjslfvj8gdouhqoo5n2iny4ny5i3lfh56",
      "accountRelation": {
        "type": "list"
      }
    }
  },
  "objects": {
    "Composite": {
      "name": {
        "type": "string",
        "required": true
      },
      "revoke": {
        "type": "boolean",
        "required": false
      },
      "schema": {
        "type": "string",
        "required": true
      },
      "createAt": {
        "type": "datetime",
        "required": false
      },
      "modifiedAt": {
        "type": "datetime",
        "required": false
      },
      "description": {
        "type": "string",
        "required": false
      },
      "encodedDefinition": {
        "type": "string",
        "required": true
      },
      "creator": {
        "type": "view",
        "viewType": "documentAccount"
      },
      "version": {
        "type": "view",
        "viewType": "documentVersion"
      }
    }
  },
  "enums": {},
  "accountData": {
    "compositeList": {
      "type": "connection",
      "name": "Composite"
    }
  }
}
      